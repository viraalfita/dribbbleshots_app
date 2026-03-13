import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

let instance: DrizzleDB | undefined;

function getInstance(): DrizzleDB {
  if (!instance) {
    const dbPath = process.env.DATABASE_PATH ?? "data/elux-shots.db";
    const sqlite = new Database(dbPath);
    instance = drizzle(sqlite, { schema });
  }
  return instance;
}

export const db = new Proxy({} as DrizzleDB, {
  get(_, prop: string | symbol) {
    return getInstance()[prop as keyof DrizzleDB];
  },
});
