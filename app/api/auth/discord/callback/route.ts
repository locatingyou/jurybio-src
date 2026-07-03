import { db } from "@/db";
import { connectionsTable } from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth", "https://jury.lat"));
    }

    const { searchParams, origin } = req.nextUrl;
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=missing_code", "https://jury.lat"),
      );
    }

    const clientId = process.env.DISCORD_CLIENTID;
    const clientSecret = process.env.DISCORD_CLIENTSECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Discord environment variables are not configured");
    }

    const redirectUri = `https://jury.lat/api/auth/discord/callback`;

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Discord token exchange failed:", errorText);
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=token_exchange_failed", "https://jury.lat"),
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=user_fetch_failed", "https://jury.lat"),
      );
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;
    const discordUsername = discordUser.username;

    // discord connections are oauth-only here (no ongoing api calls),
    // so we don't persist the access/refresh tokens
    await db
      .insert(connectionsTable)
      .values({
        userId: session.userId,
        providerType: "discord",
        accountId: discordId,
      })
      .onConflictDoUpdate({
        target: [connectionsTable.userId, connectionsTable.providerType],
        set: {
          accountId: discordId,
          updatedAt: new Date(),
        },
      });

    return NextResponse.redirect(
      new URL("/dashboard/settings?discord_connected=true", "https://jury.lat"),
    );
  } catch (error) {
    console.error("Discord callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=unknown", "https://jury.lat"),
    );
  }
}
