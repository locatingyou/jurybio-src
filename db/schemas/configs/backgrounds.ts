import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";
export const filetypeEnum = pgEnum("file_type", ["video", "image"]);
export const backgroundsTable = pgTable("backgrounds", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text().notNull(),
  position: integer().notNull().default(0),
  background_url: text().notNull(),
  file_type: filetypeEnum().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
