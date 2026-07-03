import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";
export const badgesTable = pgTable("badges", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text(),
  icon: text(),
  icon_url: text(),
  position: integer().notNull().default(0),
  enabled: boolean().notNull().default(true),
  icon_color: text().notNull().default("#FFFFFF"),
  createdAt: timestamp().defaultNow().notNull(),
});
