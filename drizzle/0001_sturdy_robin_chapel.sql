CREATE TYPE "public"."avatar_shape" AS ENUM('SQUARE', 'ROUNDED', 'CIRCLE');--> statement-breakpoint
CREATE TYPE "public"."border_radius" AS ENUM('None', 'Small', 'Medium', 'Large', 'XL');--> statement-breakpoint
CREATE TYPE "public"."card_animation" AS ENUM('None', 'Slide Up', 'Slide Down', 'Zoom In', 'Zoom Out', 'Bounce');--> statement-breakpoint
CREATE TYPE "public"."card_layout" AS ENUM('Stacked', 'Compact', 'Simplistic', 'Portfolio');--> statement-breakpoint
CREATE TYPE "public"."entry_animation" AS ENUM('Normal', 'Split');--> statement-breakpoint
CREATE TYPE "public"."link_animation" AS ENUM('None', 'Fade In', 'Slide Up', 'Slide Down', 'Zoom In', 'Zoom Out', 'Bounce');--> statement-breakpoint
CREATE TABLE "backgrounds" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0,
	"background_url" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "configs" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"avatar_url" text,
	"avatar_shape" "avatar_shape" DEFAULT 'CIRCLE' NOT NULL,
	"description" varchar(500),
	"background_color" text DEFAULT 'rgba(0, 0, 0)' NOT NULL,
	"text_color" text DEFAULT 'rgba(255, 255, 255)' NOT NULL,
	"username_color" text DEFAULT 'rgba(255, 255, 255)' NOT NULL,
	"glow" boolean DEFAULT false NOT NULL,
	"card_color" text DEFAULT 'rgba(21, 21, 21, 1)' NOT NULL,
	"border_color" text DEFAULT 'rgba(255, 255, 255, 1)' NOT NULL,
	"card_border_size" integer DEFAULT 1 NOT NULL,
	"border_radius" "border_radius" DEFAULT 'Medium' NOT NULL,
	"card_blur" integer DEFAULT 0 NOT NULL,
	"card_layout" "card_layout" DEFAULT 'Stacked' NOT NULL,
	"card_animation" "card_animation" DEFAULT 'Slide Up' NOT NULL,
	"card_width" integer DEFAULT 500 NOT NULL,
	"card_tilt" boolean DEFAULT false NOT NULL,
	"card_shine_border" boolean DEFAULT false NOT NULL,
	"font_family" text DEFAULT 'Roboto' NOT NULL,
	"link_animation" "link_animation" DEFAULT 'Zoom In' NOT NULL,
	"widget_background_color" text DEFAULT 'rgba(61, 61, 61, 0.1)' NOT NULL,
	"widget_border_color" text DEFAULT 'rgba(255, 255, 255, 1)' NOT NULL,
	"widget_blur" integer DEFAULT 0 NOT NULL,
	"widget_border" boolean DEFAULT true NOT NULL,
	"display_name" text,
	"location" text,
	"entry_text" text,
	"entry_animation" "entry_animation" DEFAULT 'Normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configs_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "backgrounds" ADD CONSTRAINT "backgrounds_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configs" ADD CONSTRAINT "configs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;