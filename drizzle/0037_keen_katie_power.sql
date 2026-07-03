CREATE TYPE "public"."audio_player_layout" AS ENUM('Card', 'Inline', 'Text', 'June');--> statement-breakpoint
CREATE TYPE "public"."audio_player_position" AS ENUM('Top', 'Bottom');--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "audio_player_layout" "audio_player_layout" DEFAULT 'Card' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "audio_player_position" "audio_player_position" DEFAULT 'Bottom' NOT NULL;