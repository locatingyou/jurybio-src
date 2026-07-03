CREATE TABLE "analytics_views" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"visitorId" text,
	"ip" text NOT NULL,
	"country" text NOT NULL,
	"fingerprint" text NOT NULL,
	"userAgent" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_views" ADD CONSTRAINT "analytics_views_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_views" ADD CONSTRAINT "analytics_views_visitorId_users_id_fk" FOREIGN KEY ("visitorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;