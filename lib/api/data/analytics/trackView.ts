"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { db } from "@/db";
import { usersTable, viewsTable } from "@/db/schemas";
import { and, eq, gte, or } from "drizzle-orm";
import { verifyTurnstileToken } from "@/lib/cloduflare/turnstile";
import getIpDetails from "../../utils/ipDeatils";
import { hashIP } from "../../utils/hashIp";
import { getSession } from "@/lib/auth";

const DIFFICULTY = 2;

function verifyPoW([challenge, nonce]: [string, number]): boolean {
  return createHash("sha256")
    .update(`${challenge}:${nonce}`)
    .digest("hex")
    .startsWith("0".repeat(DIFFICULTY));
}

// code got 2 messy thx claude for refactor <3
export async function trackView({
  userId,
  cloudflare,
  pow,
  device,
}: {
  userId: string;
  cloudflare: string[];
  pow: [string, number];
  device: "mobile" | "desktop";
}) {
  const [session, headersList] = await Promise.all([getSession(), headers()]);
  if (process.env.NODE_ENV === "production") {
    const turnstileValid = await verifyTurnstileToken(cloudflare.join(""));
    if (!turnstileValid) return { error: "Invalid captcha verification" };
  }
  if (!verifyPoW(pow)) return { error: "Invalid proof of work" };
  const ip =
    headersList.get("cf-connecting-ip") ??
    headersList.get("x-forwarded-for") ??
    "unknown";
  if (ip === "unknown") return { error: "Unknown IP" };
  const countryCode = headersList.get("cf-ipcountry") ?? "unknown";
  const { risk } = await getIpDetails({ ip });
  if (risk.is_vpn || risk.is_tor || risk.is_proxy || risk.is_datacenter)
    return { error: "Proxy/VPN not allowed" };
  const user = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (user.length === 0) return { error: "User not found" };

  const hashedIp = hashIP(ip);
  const fingerprint = createHash("sha256")
    .update(`${pow[0]}:${pow[1]}`)
    .digest("hex");

  const existing = await db
    .select()
    .from(viewsTable)
    .where(
      and(
        eq(viewsTable.userId, userId),
        or(
          eq(viewsTable.ip, hashedIp),
          eq(viewsTable.fingerprint, fingerprint),
        ),
        gte(viewsTable.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )
    .limit(1);

  if (existing.length > 0) return { error: "Already viewed" };

  await db.insert(viewsTable).values({
    userId,
    ip: hashedIp,
    visitorId: session?.userId,
    country: countryCode,
    fingerprint,
    device,
  });

  return { success: true };
}
