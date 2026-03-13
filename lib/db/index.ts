import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let instance: DrizzleDb | undefined;

function getDb(): DrizzleDb {
  if (!instance) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required to use the database client.");
    }

    const sql = neon(databaseUrl);
    instance = drizzle(sql, { schema });
  }

  return instance;
}

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop: string | symbol) {
    return getDb()[prop as keyof DrizzleDb];
  },
});
