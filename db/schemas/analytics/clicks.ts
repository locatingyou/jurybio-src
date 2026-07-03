import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const clicksTable = pgTable("analytics_link_clicks", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // ill add link id shit here when thats done :3
  ip: text().notNull(),
  fingerprint: text().notNull(),

  createdAt: timestamp().defaultNow().notNull(),
});
