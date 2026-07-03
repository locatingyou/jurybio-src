import { db } from "@/db";
import { badgesTable, connectionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { BADGE_CONFIG, getColor } from "@/lib/badges";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const PRESENCE_DISCORD_API = "http://discord.jury.lat";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const [connection] = await db
      .select({ discordId: connectionsTable.accountId })
      .from(connectionsTable)
      .where(
        and(
          eq(connectionsTable.userId, session.userId),
          eq(connectionsTable.providerType, "discord")
        )
      );

    if (!connection || !connection.discordId) {
      throw new JuryError("Discord account is not connected", 400);
    }

    const res = await fetch(`${PRESENCE_DISCORD_API}/${connection.discordId}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new JuryError("Discord user not found on the server", res.status);
    }

    const discordData = await res.json();
    const roles: string[] = discordData?.data?.roles || discordData?.roles || [];

    if (!Array.isArray(roles)) {
      throw new JuryError("Invalid roles format from Discord API", 500);
    }
    const lowerRoles = roles.map(r => r.toLowerCase());
    
    const hasGuildTag = 
      discordData?.data?.clan?.tag?.toLowerCase() === "jury" || 
      discordData?.clan?.tag?.toLowerCase() === "jury";

    const existingBadges = await db
      .select({ icon: badgesTable.icon })
      .from(badgesTable)
      .where(eq(badgesTable.userId, session.userId));

    const existingIcons = new Set(existingBadges.map(b => b.icon));
    let addedCount = 0;

    const currentBadges = await db
      .select({ position: badgesTable.position })
      .from(badgesTable)
      .where(eq(badgesTable.userId, session.userId))
      .orderBy(badgesTable.position);

    let nextPosition = currentBadges.length;

    for (const [key, config] of Object.entries(BADGE_CONFIG)) {
      let shouldGive = lowerRoles.includes(config.name.toLowerCase());
      if (key === "guild_tag" && hasGuildTag) {
        shouldGive = true;
      }

      if (shouldGive) {
        const iconValue = key === "og" ? "og_users" : key;

        if (!existingIcons.has(iconValue) && !existingIcons.has(key)) {
          await db
            .insert(badgesTable)
            .values({
              userId: session.userId,
              name: config.name,
              icon: iconValue,
              icon_color: getColor(key),
              position: nextPosition,
            });
          nextPosition++;
          addedCount++;
          existingIcons.add(iconValue);
        }
      }
    }

    return NextResponse.json({ success: true, added: addedCount }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
