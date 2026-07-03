ALTER TABLE "configs" RENAME COLUMN "glow" TO "badge_glow";--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "badge_size" integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "badge_glow_strength" integer DEFAULT 0 NOT NULL;