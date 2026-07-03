"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { JuryError } from "@/lib/error";
import { eq } from "drizzle-orm";

export async function verifyEmailToken({ token }: { token: string }) {
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        verificationToken: usersTable.verificationToken,
        verificationTokenExpiresAt: usersTable.verificationTokenExpiresAt,
      })
      .from(usersTable)
      .where(eq(usersTable.verificationToken, token));

    if (!user) {
      throw new JuryError("Token not found", 404);
    }

    if (
      user.verificationTokenExpiresAt &&
      user.verificationTokenExpiresAt < new Date()
    ) {
      throw new JuryError("Token expired", 410);
    }

    await db
      .update(usersTable)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      })
      .where(eq(usersTable.id, user.id));

    return { success: true, status: 200 };
  } catch (error) {
    if (error instanceof JuryError) {
      return { success: false, error: error.message, status: error.status };
    }
    return { success: false, error: "Internal server error", status: 500 };
  }
}
