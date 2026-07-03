import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: varchar({ length: 255 }).notNull().unique(),
  url: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  uid: integer().notNull(),
  // roles (this couldve been done better smh)
  premium: boolean().default(false).notNull(),
  premium_since: timestamp(),
  // staff roles
  admin: boolean().default(false).notNull(),
  superadmin: boolean().default(false).notNull(),
  owner: boolean().default(false).notNull(),
  // blacklist
  blacklisted: boolean().default(false).notNull(),
  blacklisted_reason: text(),
  blacklisted_by: text(),
  blacklisted_at: timestamp(),
  // verification
  emailVerified: boolean().notNull().default(false),
  emailVerifiedAt: timestamp(),
  verificationToken: text().unique(),
  verificationTokenExpiresAt: timestamp(),
  // password reset shit
  resetPasswordToken: text().unique(),
  resetPasswordTokenExpiresAt: timestamp(),
  // hey retard next time u work on schema KEEP THIS HERE!!!
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  deletedAt: timestamp(),
});
