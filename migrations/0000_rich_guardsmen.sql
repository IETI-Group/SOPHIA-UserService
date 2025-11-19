CREATE TYPE "public"."learning_style" AS ENUM('visual', 'auditory', 'kinesthetic', 'reading_writing', 'gamification', 'storytelling', 'case_study', 'problem_solving', 'collaborative', 'self_paced');--> statement-breakpoint
CREATE TYPE "public"."pace_preference" AS ENUM('slow', 'normal', 'fast');--> statement-breakpoint
CREATE TYPE "public"."role_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'student', 'instructor');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('verified', 'pending', 'rejected');--> statement-breakpoint
CREATE TABLE "courses_reviews" (
	"id_course_review" uuid PRIMARY KEY NOT NULL,
	"course_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id_instructor" uuid PRIMARY KEY NOT NULL,
	"total_students" integer DEFAULT 0 NOT NULL,
	"total_courses" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric(3, 2) DEFAULT '0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	"verification_status" "verification_status" DEFAULT 'pending' NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "instructors_reviews" (
	"id_instructor_review" uuid PRIMARY KEY NOT NULL,
	"instructor_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linked_accounts" (
	"id_linked_account" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(100) NOT NULL,
	"issuer" varchar(254) NOT NULL,
	"external_id" varchar(150) NOT NULL,
	"email" varchar(254),
	"email_verified" boolean DEFAULT false NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"status" "role_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id_review" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"rate" smallint NOT NULL,
	"recommended" boolean NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id_role" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "user_role" NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_learning_profile" (
	"id_learning_profile" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"primary_style" "learning_style" NOT NULL,
	"secondary_style" "learning_style",
	"pace_preference" "pace_preference" NOT NULL,
	"interactivity_preference" smallint NOT NULL,
	"gamification_enabled" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "user_learning_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id_user" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(254) NOT NULL,
	"first_name" varchar(60) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"birth_date" timestamp NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_roles" (
	"id_user_role" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"status" "role_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses_reviews" ADD CONSTRAINT "courses_reviews_id_course_review_reviews_id_review_fk" FOREIGN KEY ("id_course_review") REFERENCES "public"."reviews"("id_review") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_id_instructor_users_id_user_fk" FOREIGN KEY ("id_instructor") REFERENCES "public"."users"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors_reviews" ADD CONSTRAINT "instructors_reviews_id_instructor_review_reviews_id_review_fk" FOREIGN KEY ("id_instructor_review") REFERENCES "public"."reviews"("id_review") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instructors_reviews" ADD CONSTRAINT "instructors_reviews_instructor_id_instructors_id_instructor_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id_instructor") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linked_accounts" ADD CONSTRAINT "linked_accounts_user_id_users_id_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_user_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_profile" ADD CONSTRAINT "user_learning_profile_user_id_users_id_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_user_id_users_id_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_role_id_roles_id_role_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id_role") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_reviews_course_id_idx" ON "courses_reviews" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "instructors_verification_status_idx" ON "instructors" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "instructors_average_rating_idx" ON "instructors" USING btree ("average_rating");--> statement-breakpoint
CREATE INDEX "instructors_verified_idx" ON "instructors" USING btree ("verification_status","verified_at");--> statement-breakpoint
CREATE INDEX "instructors_reviews_instructor_id_idx" ON "instructors_reviews" USING btree ("instructor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "linked_accounts_provider_external_id_idx" ON "linked_accounts" USING btree ("provider","external_id");--> statement-breakpoint
CREATE INDEX "linked_accounts_user_id_idx" ON "linked_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "linked_accounts_user_provider_idx" ON "linked_accounts" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "linked_accounts_user_primary_idx" ON "linked_accounts" USING btree ("user_id","is_primary");--> statement-breakpoint
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reviews_rate_idx" ON "reviews" USING btree ("rate");--> statement-breakpoint
CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "user_learning_profile_user_id_idx" ON "user_learning_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_learning_profile_primary_style_idx" ON "user_learning_profile" USING btree ("primary_style");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_name_idx" ON "users" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_birth_date_idx" ON "users" USING btree ("birth_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_roles_user_role_idx" ON "users_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX "users_roles_user_id_idx" ON "users_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_roles_role_id_idx" ON "users_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "users_roles_status_idx" ON "users_roles" USING btree ("status");