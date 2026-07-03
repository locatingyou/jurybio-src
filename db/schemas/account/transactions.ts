import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const transactionsTable = pgTable("transactions", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "set null" }),
  toUserId: text().references(() => usersTable.id, { onDelete: "set null" }),
  isGift: boolean().notNull().default(false),
  amount: integer().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});
