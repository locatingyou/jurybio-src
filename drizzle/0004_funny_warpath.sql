CREATE TYPE "public"."file_type" AS ENUM('video', 'image');--> statement-breakpoint
ALTER TABLE "backgrounds" ADD COLUMN "file_type" "file_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "background_blur" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "background_shuffle" boolean DEFAULT false NOT NULL;