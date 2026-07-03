import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  uuid,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const providerType = pgEnum("provider", ["discord", "spotify"]);

export const connectionsTable = pgTable(
  "connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    providerType: providerType("provider_type").notNull(),
    accountId: text("account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    providerAccountUnique: unique().on(table.providerType, table.accountId),
    userProviderUnique: unique().on(table.userId, table.providerType),
  }),
);
