CREATE TYPE "public"."notification_type" AS ENUM('approved', 'rejected', 'info');
--> statement-breakpoint
CREATE TYPE "public"."plan_status" AS ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected');
--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('website', 'mobile', 'dashboard');
--> statement-breakpoint
CREATE TYPE "public"."review_decision" AS ENUM('approved', 'rejected');
--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('designer', 'admin');
--> statement-breakpoint
CREATE TABLE "admin_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"decision" "review_decision" NOT NULL,
	"field_notes_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE "ai_evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"score" real NOT NULL,
	"label" text NOT NULL,
	"score_breakdown_json" jsonb NOT NULL,
	"field_feedback_json" jsonb NOT NULL,
	"overall_verdict" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer,
	"message" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE "shot_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"designer_id" integer NOT NULL,
	"parent_plan_id" integer,
	"revision_number" integer DEFAULT 1 NOT NULL,
	"general_theme_id" integer NOT NULL,
	"specific_theme" text NOT NULL,
	"title" text NOT NULL,
	"product_type" "product_type" NOT NULL,
	"target_market" text NOT NULL,
	"app_explanation" text NOT NULL,
	"sections_json" jsonb,
	"screens_json" jsonb,
	"pages_json" jsonb,
	"ref_links_json" jsonb,
	"status" "plan_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
CREATE TABLE "theme_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"macro_theme" text NOT NULL,
	"niche_name" text NOT NULL,
	"country_fit" jsonb NOT NULL,
	"buyer_fit" jsonb NOT NULL,
	"visual_potential" integer DEFAULT 70 NOT NULL,
	"authority_score" integer DEFAULT 70 NOT NULL,
	"business_relevance" integer DEFAULT 70 NOT NULL,
	"discovery_score" integer DEFAULT 70 NOT NULL,
	"generic_penalty" integer DEFAULT 0 NOT NULL,
	"notes" text
);

--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'designer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

--> statement-breakpoint
ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_plan_id_shot_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."shot_plans"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "admin_reviews" ADD CONSTRAINT "admin_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ai_evaluations" ADD CONSTRAINT "ai_evaluations_plan_id_shot_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."shot_plans"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_plan_id_shot_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."shot_plans"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shot_plans" ADD CONSTRAINT "shot_plans_designer_id_users_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shot_plans" ADD CONSTRAINT "shot_plans_parent_plan_id_shot_plans_id_fk" FOREIGN KEY ("parent_plan_id") REFERENCES "public"."shot_plans"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "shot_plans" ADD CONSTRAINT "shot_plans_general_theme_id_theme_library_id_fk" FOREIGN KEY ("general_theme_id") REFERENCES "public"."theme_library"("id") ON DELETE restrict ON UPDATE no action;