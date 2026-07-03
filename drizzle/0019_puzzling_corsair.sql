ALTER TABLE "configs" RENAME COLUMN "bio_effects" TO "cursor_effect";--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "cursor_color" text DEFAULT '#ffffff' NOT NULL;