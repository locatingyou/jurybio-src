import { NextRequest, NextResponse } from "next/server";

const PRESENCE_DISCORD_API = "http://discord.jury.lat";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing Discord ID" }, { status: 400 });
  }

  try {
    const res = await fetch(`${PRESENCE_DISCORD_API}/${id}`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Discord user not found" },
        { status: res.status },
      );
    }

    const discordUser = await res.json();
    return NextResponse.json({ data: discordUser });
  } catch (error) {
    console.error("Error fetching from Discord API:", error);
    return NextResponse.json(
      { error: "Failed to reach Discord API" },
      { status: 502 },
    );
  }
}
