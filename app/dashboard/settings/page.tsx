import { db } from "@/db";
import { usersTable, connectionsTable, sessionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import SettingsClientPage from "./SettingsClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth");
  }

  const [user] = await db
    .select({
      username: usersTable.username,
      email: usersTable.email,
      url: usersTable.url,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  if (!user) {
    redirect("/auth");
  }

  const sessions = await db
    .select({
      id: sessionsTable.id,
      token: sessionsTable.token,
      os: sessionsTable.os,
      browser: sessionsTable.browser,
      ip: sessionsTable.ip,
      isActive: sessionsTable.isActive,
      lastActive: sessionsTable.lastActive,
      createdAt: sessionsTable.createdAt,
      expiresAt: sessionsTable.expiresAt,
    })
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, session.userId))
    .orderBy(desc(sessionsTable.lastActive));

  const connections = await db
    .select({
      providerType: connectionsTable.providerType,
      accountId: connectionsTable.accountId,
    })
    .from(connectionsTable)
    .where(eq(connectionsTable.userId, session.userId));

  const discord = connections.find((c) => c.providerType === "discord");
  const spotify = connections.find((c) => c.providerType === "spotify");
  const sessionsForClient = sessions.map((s) => ({
    id: s.id,
    os: s.os,
    browser: s.browser,
    ip: s.ip,
    isActive: s.isActive,
    lastActive: s.lastActive.toISOString(),
    createdAt: s.createdAt.toISOString(),
    expiresAt: s.expiresAt.toISOString(),
    isCurrent: s.id === session.sessionId,
  }));

  return (
    <Suspense fallback={null}>
      <SettingsClientPage
        initialUser={{
          ...user,
          discordId: discord?.accountId ?? null,
          discordUsername: discord?.accountId ?? null,
          spotifyId: spotify?.accountId ?? null,
          spotifyDisplayName: spotify?.accountId ?? null,
        }}
        initialSessions={sessionsForClient}
      />
    </Suspense>
  );
}
