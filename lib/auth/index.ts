"use server";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schemas";
import { eq, and, gt } from "drizzle-orm";

const cookie_name = "_jury_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
// create session
async function createSession({ sessionId }: { sessionId: string }) {
  const session = await new SignJWT({ sessionId })
    // i wan use RS256 tho 3:
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  (await cookies()).set(cookie_name, `.DO_NOT_SHARE|${session}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export { createSession };

export async function getSession() {
  const raw = (await cookies()).get(cookie_name)?.value;
  if (!raw) return null;
  const token = raw.startsWith(".DO_NOT_SHARE|")
    ? raw.slice(".DO_NOT_SHARE|".length)
    : null;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const sessionId = payload.sessionId as string;

    const [session] = await db
      .select()
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(sessionsTable.id, sessionId),
          eq(sessionsTable.isActive, true),
          gt(sessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!session || session.users.blacklisted) return null;

    return {
      sessionId: session.sessions.id,
      userId: session.sessions.userId,
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const raw = (await cookies()).get(cookie_name)?.value;
  const token = raw?.startsWith(".DO_NOT_SHARE|")
    ? raw.slice(".DO_NOT_SHARE|".length)
    : null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const sessionId = payload.sessionId as string;
      await db
        .update(sessionsTable)
        .set({ isActive: false })
        .where(eq(sessionsTable.id, sessionId));
    } catch {
    }
  }
  (await cookies()).delete(cookie_name);
}
