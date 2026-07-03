import { handleServerErrors } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  if (!username) {
    return NextResponse.json(
      { error: "Missing Last.fm username" },
      { status: 400 },
    );
  }
  const apiKey = process.env.LASTFM_API_KEY;
  try {
    const recentTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
      username,
    )}&api_key=${apiKey}&format=json&limit=1`;

    const totalArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=library.getartists&user=${encodeURIComponent(
      username,
    )}&api_key=${apiKey}&format=json&limit=1`;

    const userInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(
      username,
    )}&api_key=${apiKey}&format=json`;

    const [recentTracksRes, artistsRes, userInfoRes] = await Promise.all([
      fetch(recentTracksUrl, { next: { revalidate: 10 } }),
      fetch(totalArtistsUrl, { next: { revalidate: 10 } }),
      fetch(userInfoUrl, { next: { revalidate: 10 } }),
    ]);

    if (!recentTracksRes.ok) {
      throw new Error(`Last.fm API returned status ${recentTracksRes.status}`);
    }

    const data = await recentTracksRes.json();

    let totalArtists = 0;
    if (artistsRes.ok) {
      const artistsData = await artistsRes.json();
      totalArtists = Number(artistsData?.artists?.["@attr"]?.total) || 0;
    }

    let avatar = null;
    if (userInfoRes.ok) {
      const userInfoData = await userInfoRes.json();
      const userImages = userInfoData?.user?.image;
      if (Array.isArray(userImages)) {
        const xlAvatar = userImages.find(
          (img: any) => img.size === "extralarge",
        );
        const lgAvatar = userImages.find((img: any) => img.size === "large");
        avatar = xlAvatar?.["#text"] || lgAvatar?.["#text"] || null;
      }
    }

    const totalScrobbles = Number(data?.recenttracks?.["@attr"]?.total) || 0;

    const recentTracks = data?.recenttracks?.track;
    if (
      !recentTracks ||
      !Array.isArray(recentTracks) ||
      recentTracks.length === 0
    ) {
      return NextResponse.json(
        {
          data: {
            user: {
              username,
              avatar,
              scrobbles: totalScrobbles,
              artists: totalArtists,
            },
          },
          song: {
            song: null,
            artist: null,
            album: null,
            albumArt: null,
          },
        },
        { status: 200 },
      );
    }

    const track = recentTracks[0];
    const nowPlaying = track["@attr"]?.nowplaying === "true";
    const song = track.name || null;
    const artist = track.artist?.["#text"] || null;
    const album = track.album?.["#text"] || null;

    let albumArt = null;
    if (track.image && Array.isArray(track.image)) {
      const xlImage = track.image.find((img: any) => img.size === "extralarge");
      const lgImage = track.image.find((img: any) => img.size === "large");
      albumArt = xlImage?.["#text"] || lgImage?.["#text"] || null;
    }

    return NextResponse.json(
      {
        data: {
          user: {
            username,
            avatar,
            scrobbles: totalScrobbles,
            artists: totalArtists,
          },
          song: {
            nowPlaying,
            song,
            artist,
            album,
            albumArt,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    handleServerErrors(error);
  }
}
