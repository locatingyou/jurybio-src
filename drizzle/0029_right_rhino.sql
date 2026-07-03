CREATE TYPE "public"."lastfm_mode" AS ENUM('now_playing', 'profile');--> statement-breakpoint
CREATE TYPE "public"."temperature_unit" AS ENUM('celsius', 'fahrenheit');--> statement-breakpoint
CREATE TYPE "public"."widget_platform" AS ENUM('weather', 'discord', 'spotify', 'lastfm');--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"platform" "widget_platform" NOT NULL,
	"type" text NOT NULL,
	"identifier" text NOT NULL,
	"weather_show_feels_like" boolean DEFAULT false NOT NULL,
	"weather_temperature_unit" "temperature_unit" DEFAULT 'celsius' NOT NULL,
	"weather_show_location" boolean DEFAULT true NOT NULL,
	"weather_show_condition" boolean DEFAULT true NOT NULL,
	"discord_show_badges" boolean DEFAULT true NOT NULL,
	"discord_show_guild_tag" boolean DEFAULT true NOT NULL,
	"discord_show_avatar_decoration" boolean DEFAULT true NOT NULL,
	"discord_show_activity" boolean DEFAULT true NOT NULL,
	"discord_show_status" boolean DEFAULT true NOT NULL,
	"spotify_show_artist" boolean DEFAULT true NOT NULL,
	"spotify_show_progress" boolean DEFAULT true NOT NULL,
	"lastfm_mode" "lastfm_mode" DEFAULT 'now_playing' NOT NULL,
	"lastfm_show_artist" boolean DEFAULT true NOT NULL,
	"lastfm_show_album" boolean DEFAULT true NOT NULL,
	"lastfm_show_scrobbles" boolean DEFAULT true NOT NULL,
	"lastfm_show_artists" boolean DEFAULT true NOT NULL,
	"show_button" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;