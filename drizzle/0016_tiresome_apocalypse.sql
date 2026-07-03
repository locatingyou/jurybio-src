ALTER TABLE "configs" ALTER COLUMN "text_color" SET DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "username_color" SET DEFAULT '#ffffff';--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "username_effects" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "bio_effects" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "background_effects" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "page_overlays" text[] DEFAULT '{}' NOT NULL;