import { verifyTurnstileToken } from "@/lib/cloduflare/turnstile";
import { handleServerErrors, JuryError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation/zod";
import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import argon2 from "argon2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { token, newPassword, confirmPassword, cloudflare } = parsed.data;

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords don't match" },
        { status: 400 },
      );
    }
    if (process.env.NODE_ENV === "production") {
      const turnstileValid = await verifyTurnstileToken(cloudflare);
      if (!turnstileValid) {
        return NextResponse.json(
          { success: false, message: "Invalid captcha verification" },
          { status: 400 },
        );
      }
    }
    const [user] = await db
      .select({
        id: usersTable.id,
        resetPasswordToken: usersTable.resetPasswordToken,
        resetPasswordTokenExpiresAt: usersTable.resetPasswordTokenExpiresAt,
      })
      .from(usersTable)
      .where(eq(usersTable.resetPasswordToken, token));
    if (!user) {
      throw new JuryError("Invalid or expired token", 404);
    }
    if (
      user.resetPasswordTokenExpiresAt &&
      user.resetPasswordTokenExpiresAt < new Date()
    ) {
      throw new JuryError("Token expired", 410);
    }
    const hashedPassword = await argon2.hash(newPassword);

    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
      })
      .where(eq(usersTable.id, user.id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof JuryError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return handleServerErrors(error);
  }
}
