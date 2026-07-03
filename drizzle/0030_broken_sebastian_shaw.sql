ALTER TYPE "public"."widget_platform" ADD VALUE 'tiktok';--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "tiktok_show_followers" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "tiktok_show_following" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "tiktok_show_likes" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "tiktok_show_videos" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "widgets" ADD COLUMN "tiktok_show_verified" boolean DEFAULT true NOT NULL;