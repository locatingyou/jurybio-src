import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const aliasesTable = pgTable("aliases", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  alias: varchar({ length: 255 }).unique(),
  createdAt: timestamp().notNull().defaultNow(),
});
