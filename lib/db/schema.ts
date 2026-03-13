import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['designer', 'admin'] }).notNull().default('designer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const themeLibrary = sqliteTable('theme_library', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  macroTheme: text('macro_theme').notNull(),
  nicheName: text('niche_name').notNull(),
  countryFit: text('country_fit', { mode: 'json' }).notNull().$type<string[]>(),
  buyerFit: text('buyer_fit', { mode: 'json' }).notNull().$type<string[]>(),
  visualPotential: integer('visual_potential').notNull().default(70),
  authorityScore: integer('authority_score').notNull().default(70),
  businessRelevance: integer('business_relevance').notNull().default(70),
  discoveryScore: integer('discovery_score').notNull().default(70),
  genericPenalty: integer('generic_penalty').notNull().default(0),
  notes: text('notes'),
});

export const shotPlans = sqliteTable('shot_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  designerId: integer('designer_id').notNull().references(() => users.id),
  parentPlanId: integer('parent_plan_id'),
  revisionNumber: integer('revision_number').notNull().default(1),
  generalThemeId: integer('general_theme_id').notNull().references(() => themeLibrary.id),
  specificTheme: text('specific_theme').notNull(),
  title: text('title').notNull(),
  productType: text('product_type', { enum: ['website', 'mobile', 'dashboard'] }).notNull(),
  targetMarket: text('target_market').notNull(),
  appExplanation: text('app_explanation').notNull(),
  sectionsJson: text('sections_json', { mode: 'json' }).$type<{ name: string; description: string }[]>(),
  screensJson: text('screens_json', { mode: 'json' }).$type<{ name: string; description: string }[]>(),
  pagesJson: text('pages_json', { mode: 'json' }).$type<{ name: string; flow: string }[]>(),
  refLinksJson: text('ref_links_json', { mode: 'json' }).$type<string[]>(),
  status: text('status', { enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'] }).notNull().default('draft'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const aiEvaluations = sqliteTable('ai_evaluations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').notNull().references(() => shotPlans.id),
  score: real('score').notNull(),
  label: text('label').notNull(),
  scoreBreakdownJson: text('score_breakdown_json', { mode: 'json' }).notNull().$type<{
    region_timing_fit: number;
    buyer_fit: number;
    authority_fit: number;
    visual_potential: number;
    business_relevance: number;
    discovery_potential: number;
    generic_penalty: number;
  }>(),
  fieldFeedbackJson: text('field_feedback_json', { mode: 'json' }).notNull().$type<{
    specific_theme: string;
    title: string;
    target_market: string;
    sections_or_screens: string;
    app_explanation: string;
  }>(),
  overallVerdict: text('overall_verdict').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const adminReviews = sqliteTable('admin_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id').notNull().references(() => shotPlans.id),
  reviewerId: integer('reviewer_id').notNull().references(() => users.id),
  decision: text('decision', { enum: ['approved', 'rejected'] }).notNull(),
  fieldNotesJson: text('field_notes_json', { mode: 'json' }).notNull().$type<{
    specific_theme?: string;
    title?: string;
    target_market?: string;
    product_type?: string;
    sections_or_screens?: string;
    app_explanation?: string;
    ref_links?: string;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  planId: integer('plan_id').references(() => shotPlans.id),
  message: text('message').notNull(),
  type: text('type', { enum: ['approved', 'rejected', 'info'] }).notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(strftime('%s', 'now'))`),
});
