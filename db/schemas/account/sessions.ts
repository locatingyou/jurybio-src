import {
  boolean,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const sessionsTable = pgTable("sessions", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text().notNull().unique(),
  os: varchar({ length: 255 }),
  browser: varchar({ length: 255 }),
  ip: varchar({ length: 64 }),
  isActive: boolean().default(true).notNull(),
  lastActive: timestamp().defaultNow().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp().notNull(),
});
