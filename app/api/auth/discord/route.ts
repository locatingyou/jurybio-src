import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const redirectUri = `https://jury.lat/api/auth/discord/callback`;
  const clientId = process.env.DISCORD_CLIENTID;
  if (!clientId) {
    return NextResponse.json(
      { error: "DISCORD_CLIENTID is not configured" },
      { status: 500 },
    );
  }

  const url = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=identify`;

  return NextResponse.redirect(url);
}
