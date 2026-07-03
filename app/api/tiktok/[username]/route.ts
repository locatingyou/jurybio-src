import { NextRequest, NextResponse } from "next/server";
import { handleServerErrors } from "@/lib/error";

interface TikTokProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isPrivate: boolean;
  followers: number;
  following: number;
  likes: number;
  videoCount: number;
  profileUrl: string;
}

async function scrape(username: string): Promise<TikTokProfile | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/@${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) return null;

    const html = await res.text();

    const match = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/,
    );
    if (!match) return null;

    const json = JSON.parse(match[1]);
    const user =
      json?.["__DEFAULT_SCOPE__"]?.["webapp.user-detail"]?.userInfo?.user;
    const stats =
      json?.["__DEFAULT_SCOPE__"]?.["webapp.user-detail"]?.userInfo?.stats;

    if (!user || !stats) return null;

    return {
      id: user.id,
      username: user.uniqueId,
      displayName: user.nickname,
      bio: user.signature ?? "",
      avatarUrl: user.avatarMedium ?? user.avatarLarger ?? "",
      verified: user.verified ?? false,
      isPrivate: user.privateAccount ?? false,
      followers: stats.followerCount ?? 0,
      following: stats.followingCount ?? 0,
      likes: stats.heartCount ?? 0,
      videoCount: stats.videoCount ?? 0,
      profileUrl: `https://www.tiktok.com/@${user.uniqueId}`,
    };
  } catch {
    return null;
  }
}

async function fetchFromDrain(username: string): Promise<TikTokProfile | null> {
  try {
    const res = await fetch(
      `https://drain.lat/api/v1/tiktok/profile/${username}`,
      {
        headers: { "x-api-key": process.env.DRAIN_API_KEY! },
        next: { revalidate: 300 },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;
    const clean = username.replace(/^@/, "");

    const data = (await scrape(clean)) ?? (await fetchFromDrain(clean));

    if (!data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
