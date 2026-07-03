CREATE TABLE "aliases" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"alias" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aliases_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"token" text NOT NULL,
	"os" varchar(255),
	"browser" varchar(255),
	"ip" varchar(64),
	"isActive" boolean DEFAULT true NOT NULL,
	"lastActive" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"toUserId" text,
	"isGift" boolean DEFAULT false NOT NULL,
	"amount" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"premium" boolean DEFAULT false NOT NULL,
	"premium_since" timestamp,
	"admin" boolean DEFAULT false NOT NULL,
	"superadmin" boolean DEFAULT false NOT NULL,
	"owner" boolean DEFAULT false NOT NULL,
	"blacklisted" boolean DEFAULT false NOT NULL,
	"blacklisted_reason" text,
	"blacklisted_by" text,
	"blacklisted_at" timestamp,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"emailVerifiedAt" timestamp,
	"verificationToken" text,
	"verificationTokenExpiresAt" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_url_unique" UNIQUE("url"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_verificationToken_unique" UNIQUE("verificationToken")
);
--> statement-breakpoint
ALTER TABLE "aliases" ADD CONSTRAINT "aliases_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_toUserId_users_id_fk" FOREIGN KEY ("toUserId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;