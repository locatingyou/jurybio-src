import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const linksTable = pgTable("links", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  icon: text().notNull(),
  icon_url: text().notNull(),
  url: text().notNull(),
  color: text().notNull(),
  enabled: boolean().notNull().default(true),
  position: integer().notNull().default(0),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
