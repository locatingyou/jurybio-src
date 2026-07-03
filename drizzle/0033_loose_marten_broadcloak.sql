ALTER TABLE "configs" ALTER COLUMN "background_effect" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."background_effect";--> statement-breakpoint
CREATE TYPE "public"."background_effect" AS ENUM('Silk', 'Plasma', 'Floating_Lines', 'Pillar');--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "background_effect" SET DATA TYPE "public"."background_effect" USING "background_effect"::"public"."background_effect";