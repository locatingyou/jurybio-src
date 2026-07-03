CREATE TYPE "public"."provider" AS ENUM('discord', 'spotify');--> statement-breakpoint
CREATE TABLE "connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"provider_type" "provider" NOT NULL,
	"account_id" text NOT NULL,
	"display_name" text,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "connections_provider_type_account_id_unique" UNIQUE("provider_type","account_id"),
	CONSTRAINT "connections_user_id_provider_type_unique" UNIQUE("user_id","provider_type")
);
--> statement-breakpoint
ALTER TABLE "connections" ADD CONSTRAINT "connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;