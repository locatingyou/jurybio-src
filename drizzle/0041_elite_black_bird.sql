CREATE TYPE "public"."action" AS ENUM('uid_swap', 'url_change', 'blacklist', 'unblacklist', 'premium_grant', 'premium_revoke', 'alias_tokens_gift');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" "action" NOT NULL,
	"performedBy" text NOT NULL,
	"targetUserId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
