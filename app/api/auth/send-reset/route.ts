import { verifyTurnstileToken } from "@/lib/cloduflare/turnstile";
import { handleServerErrors, JuryError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import z from "zod";
import { sendResetEmail } from "@/lib/api/utils/resend";

// inline cuz this wont be reused
export const sendResetSchema = z.object({
  cloudflare: z.string().min(1, "Captcha verification is required"),
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sendResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { email, cloudflare } = parsed.data;
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
        email: usersTable.email,
      })
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (!user) {
      throw new JuryError("User does not exist", 404);
    }
    // generate token
    const token = Buffer.from(
      crypto.getRandomValues(new Uint8Array(32)),
    ).toString("hex");

    await db
      .update(usersTable)
      .set({
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      })
      .where(eq(usersTable.email, email));

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
