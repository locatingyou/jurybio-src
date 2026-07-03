import { db } from "@/db";
import {
  aliasesTable,
  configsTable,
  sessionsTable,
  usersTable,
} from "@/db/schemas";
import { JuryError } from "@/lib/error";
import { desc, eq, or } from "drizzle-orm";
import argon2 from "argon2";
import { createSession } from "..";

export function parseUserAgent(userAgent: string) {
  let browser = "Unknown Browser";
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("SamsungBrowser")) browser = "Samsung Browser";
  else if (userAgent.includes("Opera") || userAgent.includes("OPR"))
    browser = "Opera";
  else if (userAgent.includes("Trident")) browser = "Internet Explorer";
  else if (userAgent.includes("Edge") || userAgent.includes("Edg"))
    browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";

  let os = "Unknown OS";
  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("X11")) os = "UNIX";
  else if (userAgent.includes("Linux")) os = "Linux";
  if (userAgent.includes("Android")) os = "Android";
  if (userAgent.includes("like Mac")) os = "iOS";

  return { browser, os };
}

export default async function createUser({
  username,
  url,
  email,
  password,
}: {
  username: string;
  url: string;
  email: string;
  password: string;
}) {
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(
      or(
        eq(usersTable.email, email),
        eq(usersTable.username, username),
        eq(usersTable.url, url),
      ),
    )
    .limit(1);
  if (existingUser.length > 0) {
    const found = existingUser[0];
    if (found.email === email) throw new JuryError("Email already taken", 409);
    if (found.username === username)
      throw new JuryError("Username already taken", 409);
    if (found.url === url) throw new JuryError("URL already taken", 409);
  }
  const existingAlias = await db
    .select()
    .from(aliasesTable)
    .where(eq(aliasesTable.alias, url))
    .limit(1);
  if (existingAlias.length > 0) throw new JuryError("URL already taken", 409);

  const [lastUser] = await db
    .select({ uid: usersTable.uid })
    .from(usersTable)
    .orderBy(desc(usersTable.uid))
    .limit(1);
  const uid = (lastUser?.uid ?? -1) + 1;

  const hashedPassword = await argon2.hash(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      uid,
      username,
      url,
      email,
      // im 2 lazy to make a function for this 💀☠️
      verificationToken: Buffer.from(
        crypto.getRandomValues(new Uint8Array(32)),
      ).toString("hex"),
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      emailVerified: false,
      password: hashedPassword,
    })
    .returning({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      url: usersTable.url,
      verificationToken: usersTable.verificationToken,
    });
  await db.insert(configsTable).values({
    userId: user.id,
  });
  return user;
}

export async function authenticateUser({
  email,
  password,
  os,
  browser,
  ip,
}: {
  email: string;
  password: string;
  os?: string;
  browser?: string;
  ip?: string;
}) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (!user) throw new JuryError("User Not Found", 404);
  const ok = await argon2.verify(user.password, password);
  if (!ok) throw new JuryError("Invalid credentials", 401);
  // this nigga got blacklisted 💀💀💀
  if (user.blacklisted) {
    throw new JuryError(
      "Account suspended. contact support for more information",
      403,
    );
  }
  // check if niggas email is verified
  if (!user.emailVerified) throw new JuryError("Email is not Verified", 403);
  // this will create the token n shit later
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [session] = await db
    .insert(sessionsTable)
    .values({
      userId: user.id,
      token: crypto.randomUUID(),
      os,
      browser,
      ip,
      isActive: true,
      expiresAt,
    })
    .returning({ id: sessionsTable.id });
  await createSession({ sessionId: session.id });
}
