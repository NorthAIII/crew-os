ALTER TABLE "hermes_settings" ADD COLUMN "max_steps" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "hermes_settings" ADD COLUMN "step_interval_days" integer DEFAULT 4 NOT NULL;