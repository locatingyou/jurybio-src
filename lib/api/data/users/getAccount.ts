import { db } from "@/db";
import {
  badgesTable,
  configsTable,
  connectionsTable,
  linksTable,
  usersTable,
} from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export default async function getAccount() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const [data] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      username: usersTable.username,
      url: usersTable.url,
      uid: usersTable.uid,
      premium: usersTable.premium,
      config: {
        avatar_url: configsTable.avatar_url,
        description: configsTable.description,
      },
      links: {
        id: linksTable.id,
      },
      connections: {
        id: connectionsTable.id,
      },
    })
    .from(usersTable)
    .leftJoin(configsTable, eq(configsTable.userId, usersTable.id))
    .leftJoin(linksTable, eq(linksTable.userId, usersTable.id))
    .leftJoin(connectionsTable, eq(connectionsTable.userId, usersTable.id))
    .where(eq(usersTable.id, session.userId));

  const claimedBadges = await db
    .select({ name: badgesTable.name })
    .from(badgesTable)
    .where(eq(badgesTable.userId, session.userId));

  return {
    ...data,
    config: data?.config ?? undefined,
    links: data?.links ?? undefined,
    connections: data?.connections ?? undefined,
    claimed_badge_ids: claimedBadges
      .map((b) => b.name)
      .filter((name): name is string => name !== null),
  };
}
