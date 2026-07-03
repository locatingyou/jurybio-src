import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const artist_name = searchParams.get("artist_name");
  const track_name = searchParams.get("track_name");
  const album_name = searchParams.get("album_name");
  const duration = searchParams.get("duration");
  if (!artist_name || !track_name) {
    return Response.json(
      { error: "artist_name and track_name are required" },
      { status: 400 },
    );
  }
  const upstreamParams = new URLSearchParams({ artist_name, track_name });
  if (album_name) upstreamParams.set("album_name", album_name);
  if (duration) upstreamParams.set("duration", duration);
  const upstreamUrl = `https://lrclib.net/api/get?${upstreamParams.toString()}`;
  const res = await fetch(upstreamUrl, {
    headers: {
      "User-Agent": "Jury (https://jury.lat)",
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    return Response.json(
      { error: body?.message ?? "Lyrics not found" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return Response.json(data);
}
