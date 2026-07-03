import { handleServerErrors, JuryError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation/zod";
import createUser from "@/lib/auth/utils";
import { verifyTurnstileToken } from "@/lib/cloduflare/turnstile";
import getIpDetails from "@/lib/api/utils/ipDeatils";
import { headers } from "next/headers";
import { sendVerificationEmail } from "@/lib/api/utils/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { username, email, password, url, cloudflare } = parsed.data;

    if (process.env.NODE_ENV === "production") {
      const turnstileValid = await verifyTurnstileToken(cloudflare);
      if (!turnstileValid) {
        return NextResponse.json(
          { success: false, message: "Invalid captcha verification" },
          { status: 400 },
        );
      }
    }

    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIP = headersList.get("x-real-ip");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : (realIP ?? "unknown");

    const ipData = await getIpDetails({ ip });
    if (
      ipData.risk.is_proxy ||
      ipData.risk.is_vpn ||
      ipData.risk.is_tor ||
      ipData.risk.is_datacenter
    ) {
      return NextResponse.json(
        { error: "Proxy/VPN not allowed" },
        { status: 403 },
      );
    }

    const user = await createUser({
      username,
      url,
      email,
      password,
    });
    if (!user.verificationToken) {
      throw new JuryError("Failed to generate verification token", 500);
    }
    sendVerificationEmail(email, user.verificationToken).catch((err) => {
      console.error("Failed to send verification email:", err);
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
