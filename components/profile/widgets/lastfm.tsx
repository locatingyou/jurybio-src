import { LastFMData } from "@/lib/types/lastfm";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaExternalLinkAlt,
  FaUser,
  FaCompactDisc,
  FaHeadphones,
} from "react-icons/fa";

export default function LastFMWidget({
  username = "paw2k",
  textColor = "#ffffff",
  secondaryTextColor = "rgba(255,255,255,0.6)",
  mode,
  options,
}: {
  username?: string;
  mode: "now_playing" | "profile";
  options: {
    show_artist: boolean;
    show_album: boolean;
    show_scrobbles: boolean;
    show_artists: boolean;
    show_button: boolean;
  };
  textColor?: string;
  secondaryTextColor?: string;
}) {
  const [lastfmData, setLastFMData] = useState<LastFMData | null>(null);

  useEffect(() => {
    fetch(`/api/lastfm/${username}`)
      .then((res) => res.json())
      .then((json) => setLastFMData(json.data ?? null))
      .catch(() => setLastFMData(null));
  }, [username]);

  if (!lastfmData?.user) return null;

  const { user, song } = lastfmData;

  if (mode === "now_playing" && !song?.song) {
    return (
      <section className="flex flex-row items-center justify-between w-full h-full min-w-0">
        <p className="text-xs text-white/60">No recent tracks</p>
      </section>
    );
  }

  const image = mode === "now_playing" ? song.albumArt : user.avatar;
  const imageAlt = mode === "now_playing" ? "album art" : "last.fm avatar";
  const title = mode === "now_playing" ? song.song : user.username;

  const buttonLabel = mode === "now_playing" ? "View Track" : "View Profile";
  const buttonHref =
    mode === "now_playing"
      ? `https://www.last.fm/music/${encodeURIComponent(
          song.artist || "",
        )}/_/${encodeURIComponent(song.song || "")}`
      : `https://www.last.fm/user/${user.username}`;

  return (
    <section className="flex flex-row items-center justify-between w-full h-full min-w-0">
      <div className="flex flex-row items-center min-w-0">
        <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white/5">
          {image && (
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="56px"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col justify-center ml-3 min-w-0">
          <h1
            style={{ color: textColor }}
            className="text-sm font-semibold truncate"
          >
            {title}
          </h1>
          {mode === "now_playing" ? (
            <p
              style={{ color: secondaryTextColor }}
              className="text-xs flex flex-row gap-2"
            >
              {options.show_artist && song.artist && (
                <span className="flex items-center gap-1.5 truncate">
                  <FaUser className="h-3 w-3 shrink-0" />
                  {song.artist}
                </span>
              )}
              {options.show_album && song.album && (
                <span className="flex items-center gap-1.5 truncate">
                  <FaCompactDisc className="h-3 w-3 shrink-0" />
                  {song.album}
                </span>
              )}
            </p>
          ) : (
            <p
              style={{ color: secondaryTextColor }}
              className="text-xs flex flex-row gap-2"
            >
              {options.show_scrobbles && (
                <span className="flex items-center gap-1.5">
                  <FaHeadphones className="h-3 w-3 shrink-0" />
                  {user.scrobbles.toLocaleString()} scrobbles
                </span>
              )}
              {options.show_artists && (
                <span className="flex items-center gap-1.5">
                  <FaUser className="h-3 w-3 shrink-0" />
                  {user.artists.toLocaleString()} artists
                </span>
              )}
            </p>
          )}

          {options.show_button && (
            <Link
              className="text-xs flex flex-row gap-2 items-center text-black bg-white justify-center rounded-xl py-0.5 px-2 mt-1 w-fit"
              href={buttonHref}
              target="_blank"
            >
              {buttonLabel} <FaExternalLinkAlt />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
