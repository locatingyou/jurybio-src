import {
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const fontsTable = pgTable("fonts", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  font_url: text().notNull(),
  position: integer().notNull().default(0),
  createdAt: timestamp().defaultNow().notNull(),
});
