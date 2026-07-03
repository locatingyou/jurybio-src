CREATE TYPE "public"."widget_animation" AS ENUM('None', 'Fade In', 'Slide Up', 'Slide Down');--> statement-breakpoint
ALTER TABLE "configs" RENAME COLUMN "widget_background_color" TO "secondary_card_color";--> statement-breakpoint
ALTER TABLE "configs" RENAME COLUMN "widget_border_color" TO "condary_border_color";--> statement-breakpoint
ALTER TABLE "configs" ALTER COLUMN "cursor_effect" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "secondary_card_border_size" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "secondary_border_radius" "border_radius" DEFAULT 'Medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "secondary_font_family" text DEFAULT 'Roboto' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "widget_animation" "widget_animation" DEFAULT 'None' NOT NULL;--> statement-breakpoint
ALTER TABLE "configs" DROP COLUMN "widget_blur";--> statement-breakpoint
ALTER TABLE "configs" DROP COLUMN "widget_border";