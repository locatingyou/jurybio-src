import { db } from "@/db";
import { badgesTable, usersTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, JuryError } from "@/lib/error";
import { BADGE_CONFIG, getColor } from "@/lib/badges";
import { eq, and, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const OG_LIMIT = 50;

const claimSchema = z.object({
  badge_id: z.string().min(1),
});

const CLAIMABLE_BADGES = new Set([
  "og",
  "halloween",
  "christmas",
  "easter",
  "valentines",
]);

const BADGE_ICON_MAP: Record<string, string> = {
  og: "og_users",
  halloween: "halloween",
  christmas: "christmas",
  easter: "easter",
  valentines: "valentines",
};

const BADGE_DATES: Record<string, { month: number; day: number }> = {
  halloween: { month: 10, day: 31 },
  christmas: { month: 12, day: 25 },
  valentines: { month: 2, day: 14 },
};

function getEasterDate(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

function isBadgeClaimableToday(badgeId: string): boolean {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (badgeId === "easter") {
    const easter = getEasterDate(now.getFullYear());
    return month === easter.month && day === easter.day;
  }

  const fixedDate = BADGE_DATES[badgeId];
  if (!fixedDate) return true;

  return month === fixedDate.month && day === fixedDate.day;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);
    const body = await req.json();
    const parsed = claimSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { badge_id } = parsed.data;
    const normalizedBadgeId = badge_id.toLowerCase();

    const config = BADGE_CONFIG[normalizedBadgeId];
    if (!config) throw new JuryError("Badge not found", 404);
    if (!CLAIMABLE_BADGES.has(normalizedBadgeId)) {
      throw new JuryError("This badge cannot be claimed", 403);
    }

    if (normalizedBadgeId in BADGE_DATES || normalizedBadgeId === "easter") {
      if (!isBadgeClaimableToday(normalizedBadgeId)) {
        throw new JuryError("This badge is only claimable on its holiday", 403);
      }
    }

    const iconValue = BADGE_ICON_MAP[normalizedBadgeId];
    const existing = await db
      .select({ id: badgesTable.id })
      .from(badgesTable)
      .where(
        and(
          eq(badgesTable.userId, session.userId),
          eq(badgesTable.icon, iconValue),
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      throw new JuryError("You already have this badge", 409);
    }

    if (normalizedBadgeId === "og") {
      const [{ value: totalClaimed }] = await db
        .select({ value: count() })
        .from(badgesTable)
        .where(eq(badgesTable.icon, "og_users"));
      if (totalClaimed >= OG_LIMIT) {
        throw new JuryError("OG badge has been fully claimed", 410);
      }
      const [user] = await db
        .select({ uid: usersTable.uid })
        .from(usersTable)
        .where(eq(usersTable.id, session.userId));
      if (!user) throw new JuryError("User not found", 404);
      if (user.uid >= OG_LIMIT) {
        throw new JuryError("OG badge is only for the first 50 users", 403);
      }
    }

    const currentBadges = await db
      .select({ position: badgesTable.position })
      .from(badgesTable)
      .where(eq(badgesTable.userId, session.userId))
      .orderBy(badgesTable.position);
    const nextPosition = currentBadges.length;
    const [badge] = await db
      .insert(badgesTable)
      .values({
        userId: session.userId,
        name: config.name,
        icon: iconValue,
        icon_color: getColor(normalizedBadgeId),
        position: nextPosition,
      })
      .returning();
    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
