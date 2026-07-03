CREATE TABLE "badges" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"icon" text,
	"icon_url" text,
	"position" integer DEFAULT 0 NOT NULL,
	"icon_color" text DEFAULT '#FFFFFF' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "badges" ADD CONSTRAINT "badges_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."file_type";