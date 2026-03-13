import { generateDrizzleJson, generateMigration } from "drizzle-kit/api";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const drizzleDir = path.join(projectRoot, "drizzle");
const metaDir = path.join(drizzleDir, "meta");
const schemaPath = path.join(projectRoot, "lib", "db", "schema.ts");
const snapshotVersion = "7";
const breakpoint = "\n--> statement-breakpoint\n";

function sanitizeName(input) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "migration"
  );
}

async function loadSchemaModule() {
  const source = await fs.readFile(schemaPath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      resolveJsonModule: true,
    },
    fileName: schemaPath,
  }).outputText;

  const tempModulePath = path.join(
    projectRoot,
    ".drizzle-schema.generated.mjs",
  );
  await fs.writeFile(tempModulePath, transpiled, "utf8");

  try {
    return await import(
      `${pathToFileURL(tempModulePath).href}?ts=${Date.now()}`
    );
  } finally {
    await fs.rm(tempModulePath, { force: true });
  }
}

async function readJournal() {
  await fs.mkdir(metaDir, { recursive: true });
  const journalPath = path.join(metaDir, "_journal.json");

  try {
    const content = await fs.readFile(journalPath, "utf8");
    return JSON.parse(content);
  } catch {
    const journal = {
      version: snapshotVersion,
      dialect: "postgresql",
      entries: [],
    };
    await fs.writeFile(journalPath, JSON.stringify(journal, null, 2));
    return journal;
  }
}

async function readPreviousSnapshot(journal) {
  const lastEntry = journal.entries.at(-1);
  if (!lastEntry) {
    return generateDrizzleJson({});
  }

  const prefix = lastEntry.idx.toString().padStart(4, "0");
  const snapshotPath = path.join(metaDir, `${prefix}_snapshot.json`);
  const content = await fs.readFile(snapshotPath, "utf8");
  return JSON.parse(content);
}

async function main() {
  const journal = await readJournal();
  const prev = await readPreviousSnapshot(journal);
  const schemaModule = await loadSchemaModule();
  const cur = generateDrizzleJson(schemaModule, prev.id);
  const sqlStatements = await generateMigration(prev, cur);

  if (sqlStatements.length === 0) {
    console.log("No schema changes detected.");
    return;
  }

  const idx = journal.entries.length === 0 ? 0 : journal.entries.at(-1).idx + 1;
  const prefix = idx.toString().padStart(4, "0");
  const migrationName = sanitizeName(process.argv[2] ?? "initial_schema");
  const tag = `${prefix}_${migrationName}`;
  const when = Date.now();

  await fs.writeFile(
    path.join(drizzleDir, `${tag}.sql`),
    sqlStatements.join(breakpoint),
    "utf8",
  );
  await fs.writeFile(
    path.join(metaDir, `${prefix}_snapshot.json`),
    JSON.stringify(cur, null, 2),
    "utf8",
  );

  journal.entries.push({
    idx,
    version: cur.version,
    when,
    tag,
    breakpoints: true,
  });

  await fs.writeFile(
    path.join(metaDir, "_journal.json"),
    JSON.stringify(journal, null, 2),
    "utf8",
  );
  console.log(`Generated migration ${tag}.sql`);
}

main().catch((error) => {
  console.error("Migration generation failed:", error);
  process.exit(1);
});
