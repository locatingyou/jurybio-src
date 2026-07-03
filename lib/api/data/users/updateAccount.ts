"use server";
import { db } from "@/db";
import { usersTable, aliasesTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { JuryError } from "@/lib/error";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import argon2 from "argon2";

const RESERVED_URLS = new Set([
  "legal",
  "privacy",
  "terms",
  "auth",
  "verification",
  "dashboard",
  "settings",
  "profile",
  "api",
  "ratelimit",
]);

const settingsSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9-]+$/i)
    .optional(),
  email: z.string().email().optional(),
  url: z
    .string()
    .min(1)
    .max(64)
    .trim()
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      "URL can only contain letters, numbers, and hyphens",
    )
    .refine((u) => !RESERVED_URLS.has(u.toLowerCase()), "This URL is reserved")
    .optional(),
  password: z
    .object({
      oldPassword: z.string().min(1),
      newPassword: z.string().min(8).max(128),
    })
    .optional(),
});

export async function updateAccount(body: unknown) {
  try {
    const session = await getSession();
    if (!session) throw new JuryError("Unauthorized", 401);

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0];
      throw new JuryError(firstError || "Validation failed", 400);
    }

    const { username, email, url, password } = parsed.data;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId));
    if (!user) throw new JuryError("User not found", 404);

    if (password) {
      const ok = await argon2.verify(user.password, password.oldPassword);
      if (!ok) throw new JuryError("Current password is incorrect", 401);
      const hashed = await argon2.hash(password.newPassword);
      await db
        .update(usersTable)
        .set({ password: hashed, updatedAt: new Date() })
        .where(eq(usersTable.id, session.userId));
      return { success: true };
    }

    if (username || email || url) {
      const conditions = [];
      if (username) conditions.push(eq(usersTable.username, username));
      if (email) conditions.push(eq(usersTable.email, email));
      if (url) conditions.push(eq(usersTable.url, url));

      // Only query if conditions exist
      if (conditions.length > 0) {
        const existing = await db
          .select({
            id: usersTable.id,
            username: usersTable.username,
            email: usersTable.email,
            url: usersTable.url,
          })
          .from(usersTable)
          .where(or(...conditions));

        for (const found of existing) {
          if (found.id !== session.userId) {
            if (username && found.username === username)
              throw new JuryError("Username already taken", 409);
            if (email && found.email === email)
              throw new JuryError("Email already taken", 409);
            if (url && found.url === url)
              throw new JuryError("URL already taken", 409);
          }
        }
      }

      if (url) {
        const [existingAlias] = await db
          .select({ userId: aliasesTable.userId })
          .from(aliasesTable)
          .where(eq(aliasesTable.alias, url));
        if (existingAlias && existingAlias.userId !== session.userId)
          throw new JuryError("URL already taken as an alias", 409);
      }
    }

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (username) patch.username = username;
    if (email) patch.email = email;
    if (url) patch.url = url;

    if (Object.keys(patch).length > 1) {
      await db
        .update(usersTable)
        .set(patch)
        .where(eq(usersTable.id, session.userId));
    }

    return { success: true };
  } catch (error) {
    if (error instanceof JuryError) {
      return { error: error.message, status: error.status };
    }
    return { error: "Internal server error", status: 500 };
  }
}
