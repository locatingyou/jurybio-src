"use server";
import { db } from "@/db";
import { viewsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { and, eq, gte, lt, sql } from "drizzle-orm";

export default async function getAnalytics({
  timeRange,
}: {
  timeRange: string; //24h, 7d, 2w, etc etc :3
}) {
  const session = await getSession();
  if (!session) return null;

  const match = timeRange.match(/^(\d+)([hdw])$/);
  const amount = match ? parseInt(match[1], 10) : 0;
  const unit = match ? match[2] : null;
  const msPerUnit = { h: 3600_000, d: 86_400_000, w: 604_800_000 } as const;

  const windowMs = unit ? amount * msPerUnit[unit as "h" | "d" | "w"] : null;

  const startDate = windowMs ? new Date(Date.now() - windowMs) : new Date(0);
  const previousStartDate = windowMs
    ? new Date(startDate.getTime() - windowMs)
    : null;

  /*
    views: [
      {
      "device": ""
      "date": "",
      "count": 0
      }
    ]
    clicks: [
      {
        "link": "",
        "url": "",
        "count": 0
      }
    ]
  */
  const views = await db
    .select({
      date: sql<string>`DATE(${viewsTable.createdAt})`.as("date"),
      device: viewsTable.device,
      count: sql<number>`count(*)::int`.as("count"),
    })
    .from(viewsTable)
    .where(
      and(
        eq(viewsTable.userId, session.userId),
        gte(viewsTable.createdAt, startDate),
      ),
    )
    .groupBy(sql`DATE(${viewsTable.createdAt})`, viewsTable.device);

  let previousPeriodViews = 0;
  if (previousStartDate) {
    const [previousViewsResult] = await db
      .select({
        count: sql<number>`count(*)::int`.as("count"),
      })
      .from(viewsTable)
      .where(
        and(
          eq(viewsTable.userId, session.userId),
          gte(viewsTable.createdAt, previousStartDate),
          lt(viewsTable.createdAt, startDate),
        ),
      );
    previousPeriodViews = previousViewsResult?.count ?? 0;
  }

  return {
    views,
    clicks: [],
    previousPeriodViews,
  };
}
