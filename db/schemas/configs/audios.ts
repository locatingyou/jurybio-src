import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const audiosTable = pgTable("audios", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  artist: text(),
  url: text().notNull(),
  cover_url: text(),
  position: integer().notNull().default(0),
  lyrics: text(),
  createdAt: timestamp().defaultNow().notNull(),
});
