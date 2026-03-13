import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import seedThemes from "./seed-data.json" with { type: "json" };

dotenv.config({ path: ".env.local" });
dotenv.config();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the database.");
  }
  return databaseUrl;
}

async function main() {
  const sql = neon(requireDatabaseUrl());
  const adminHash = await bcrypt.hash("admin123", 10);
  const designerHash = await bcrypt.hash("designer123", 10);

  const themeQueries = seedThemes.map((theme) =>
    sql(
      `
        INSERT INTO theme_library (
          macro_theme,
          niche_name,
          country_fit,
          buyer_fit,
          visual_potential,
          authority_score,
          business_relevance,
          discovery_score,
          generic_penalty,
          notes
        ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7, $8, $9, $10)
      `,
      [
        theme.macroTheme,
        theme.nicheName,
        JSON.stringify(theme.countryFit),
        JSON.stringify(theme.buyerFit),
        theme.visualPotential,
        theme.authorityScore,
        theme.businessRelevance,
        theme.discoveryScore,
        theme.genericPenalty,
        theme.notes,
      ],
    ),
  );

  await sql.transaction([
    sql(`
      TRUNCATE TABLE
        notifications,
        admin_reviews,
        ai_evaluations,
        shot_plans,
        theme_library,
        users
      RESTART IDENTITY CASCADE
    `),
    sql(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      ["admin", adminHash, "admin"],
    ),
    sql(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`,
      ["designer1", designerHash, "designer"],
    ),
    ...themeQueries,
  ]);

  console.log("Seed complete. Default credentials:");
  console.log("  admin / admin123");
  console.log("  designer1 / designer123");
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
