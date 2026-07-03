CREATE TYPE "public"."background_effect" AS ENUM('Silk', 'Plasma', 'Floating_Lines', 'Liquid');--> statement-breakpoint
ALTER TABLE "configs" RENAME COLUMN "background_effects" TO "theme_color";--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "page_overlays" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "page_overlays" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "page_overlays" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "background_effect" "background_effect";