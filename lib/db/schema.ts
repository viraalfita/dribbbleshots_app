import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["designer", "admin"]);
export const productTypeEnum = pgEnum("product_type", [
  "website",
  "mobile",
  "dashboard",
]);
export const planStatusEnum = pgEnum("plan_status", [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
]);
export const reviewDecisionEnum = pgEnum("review_decision", [
  "approved",
  "rejected",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "approved",
  "rejected",
  "info",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("designer"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const themeLibrary = pgTable("theme_library", {
  id: serial("id").primaryKey(),
  macroTheme: text("macro_theme").notNull(),
  nicheName: text("niche_name").notNull(),
  countryFit: jsonb("country_fit").$type<string[]>().notNull(),
  buyerFit: jsonb("buyer_fit").$type<string[]>().notNull(),
  visualPotential: integer("visual_potential").notNull().default(70),
  authorityScore: integer("authority_score").notNull().default(70),
  businessRelevance: integer("business_relevance").notNull().default(70),
  discoveryScore: integer("discovery_score").notNull().default(70),
  genericPenalty: integer("generic_penalty").notNull().default(0),
  notes: text("notes"),
});

export const shotPlans = pgTable("shot_plans", {
  id: serial("id").primaryKey(),
  designerId: integer("designer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentPlanId: integer("parent_plan_id").references(
    (): AnyPgColumn => shotPlans.id,
    { onDelete: "set null" },
  ),
  revisionNumber: integer("revision_number").notNull().default(1),
  generalThemeId: integer("general_theme_id")
    .notNull()
    .references(() => themeLibrary.id, { onDelete: "restrict" }),
  specificTheme: text("specific_theme").notNull(),
  title: text("title").notNull(),
  productType: productTypeEnum("product_type").notNull(),
  targetMarket: text("target_market").notNull(),
  appExplanation: text("app_explanation").notNull(),
  sectionsJson:
    jsonb("sections_json").$type<{ name: string; description: string }[]>(),
  screensJson:
    jsonb("screens_json").$type<{ name: string; description: string }[]>(),
  pagesJson: jsonb("pages_json").$type<{ name: string; flow: string }[]>(),
  refLinksJson: jsonb("ref_links_json").$type<string[]>(),
  status: planStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const aiEvaluations = pgTable("ai_evaluations", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id")
    .notNull()
    .references(() => shotPlans.id, { onDelete: "cascade" }),
  score: real("score").notNull(),
  label: text("label").notNull(),
  scoreBreakdownJson: jsonb("score_breakdown_json").notNull().$type<{
    region_timing_fit: number;
    buyer_fit: number;
    authority_fit: number;
    visual_potential: number;
    business_relevance: number;
    discovery_potential: number;
    generic_penalty: number;
  }>(),
  fieldFeedbackJson: jsonb("field_feedback_json").notNull().$type<{
    specific_theme: string;
    title: string;
    target_market: string;
    sections_or_screens: string;
    app_explanation: string;
  }>(),
  overallVerdict: text("overall_verdict").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const adminReviews = pgTable("admin_reviews", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id")
    .notNull()
    .references(() => shotPlans.id, { onDelete: "cascade" }),
  reviewerId: integer("reviewer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  decision: reviewDecisionEnum("decision").notNull(),
  fieldNotesJson: jsonb("field_notes_json").notNull().$type<{
    specific_theme?: string;
    title?: string;
    target_market?: string;
    product_type?: string;
    sections_or_screens?: string;
    app_explanation?: string;
    ref_links?: string;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  planId: integer("plan_id").references(() => shotPlans.id, {
    onDelete: "set null",
  }),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
