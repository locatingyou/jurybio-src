ALTER TABLE "users" ADD COLUMN "resetPasswordToken" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "resetPasswordTokenExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_resetPasswordToken_unique" UNIQUE("resetPasswordToken");