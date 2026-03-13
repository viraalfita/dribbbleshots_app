import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";
import { themeLibrary, users } from "../lib/db/schema";
import seedThemes from "./seed-data.json";

async function seed() {
  console.log("Seeding PostgreSQL database...");

  await db.execute(sql`
        TRUNCATE TABLE
            notifications,
            admin_reviews,
            ai_evaluations,
            shot_plans,
            theme_library,
            users
        RESTART IDENTITY CASCADE
    `);

  const adminHash = await bcrypt.hash("admin123", 10);
  const designerHash = await bcrypt.hash("designer123", 10);

  await db.insert(users).values([
    { username: "admin", passwordHash: adminHash, role: "admin" },
    { username: "designer1", passwordHash: designerHash, role: "designer" },
  ]);

  await db.insert(themeLibrary).values(seedThemes);

  console.log("Seed complete. Default credentials:");
  console.log("  admin / admin123");
  console.log("  designer1 / designer123");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
