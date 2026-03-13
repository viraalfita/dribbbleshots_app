import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const drizzleDir = path.join(projectRoot, "drizzle");
const journalPath = path.join(drizzleDir, "meta", "_journal.json");
const migrationsSchema = "drizzle";
const migrationsTable = "__drizzle_migrations";
const breakpoint = "--> statement-breakpoint";

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run migrations.");
  }
  return databaseUrl;
}

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const sql = neon(databaseUrl);
  const journal = JSON.parse(await fs.readFile(journalPath, "utf8"));

  if (!Array.isArray(journal.entries) || journal.entries.length === 0) {
    console.log("No migrations to apply.");
    return;
  }

  await sql(`CREATE SCHEMA IF NOT EXISTS "${migrationsSchema}"`);
  await sql(`
    CREATE TABLE IF NOT EXISTS "${migrationsSchema}"."${migrationsTable}" (
      "id" SERIAL PRIMARY KEY,
      "hash" text NOT NULL,
      "created_at" bigint NOT NULL
    )
  `);

  const appliedRows = await sql(
    `SELECT created_at FROM "${migrationsSchema}"."${migrationsTable}" ORDER BY created_at DESC LIMIT 1`,
  );
  const lastAppliedAt = appliedRows[0]?.created_at
    ? Number(appliedRows[0].created_at)
    : 0;

  for (const entry of journal.entries) {
    if (Number(entry.when) <= lastAppliedAt) {
      continue;
    }

    const migrationPath = path.join(drizzleDir, `${entry.tag}.sql`);
    const fileContents = await fs.readFile(migrationPath, "utf8");
    const statements = fileContents
      .split(breakpoint)
      .map((statement) => statement.trim())
      .filter(Boolean);
    const hash = crypto.createHash("sha256").update(fileContents).digest("hex");

    await sql.transaction((txn) => [
      ...statements.map((statement) => txn(statement)),
      txn(
        `INSERT INTO "${migrationsSchema}"."${migrationsTable}" ("hash", "created_at") VALUES ($1, $2)`,
        [hash, Number(entry.when)],
      ),
    ]);

    console.log(`Applied migration ${entry.tag}`);
  }
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
