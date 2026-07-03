import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const deviceEnum = pgEnum("device", ["mobile", "desktop"]);

export const viewsTable = pgTable("analytics_views", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  visitorId: text().references(() => usersTable.id, { onDelete: "cascade" }),
  ip: text().notNull(),
  country: text().notNull(),
  fingerprint: text().notNull(),
  device: deviceEnum().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
