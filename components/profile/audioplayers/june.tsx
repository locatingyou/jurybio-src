"use client";

import Card from "../card";
import { HiMusicalNote } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaBackward,
  FaForward,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import { Config } from "@/lib/types/profile";
import { extractDominantColor } from "@/lib/color-extraction";

interface ParsedLyric {
  time: number;
  text: string;
}

const parseLyrics = (lyricsText: string | null): ParsedLyric[] => {
  if (!lyricsText || typeof lyricsText !== "string") return [];

  try {
    const lines = lyricsText.split("\n");
    const parsed: ParsedLyric[] = [];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const match = trimmedLine.match(
        /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/,
      );
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = match[3]
          ? parseInt(match[3].padEnd(3, "0"), 10)
          : 0;
        const time = minutes * 60 + seconds + milliseconds / 1000;
        const text = match[4]?.trim() || "";

        if (!isNaN(time) && text) {
          parsed.push({ time, text });
        }
      }
    });

    return parsed.sort((a, b) => a.time - b.time);
  } catch (error) {
    console.error("Error parsing lyrics:", error);
    return [];
  }
};

// rgb tuple -> "r, g, b" helper
const rgbStr = (rgb: [number, number, number] | null, fallback: string) =>
  rgb ? `${rgb[0]}, ${rgb[1]}, ${rgb[2]}` : fallback;

// Cache-bust so this request is never served from a cache entry that was
// populated by a non-CORS load elsewhere (which would taint the canvas).
const withColorExtractParam = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}colorExtract=1`;

export default function JuneAudioPlayer({
  config,
  autoStart = false,
}: {
  autoStart?: boolean;
  config: Config;
}) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolume, setShowVolume] = useState(false);
  const [dominantColor, setDominantColor] = useState<
    [number, number, number] | null
  >(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const audios = config.audios ?? [];
  const track = audios[trackIndex];
  const hasPrev = Boolean(trackIndex > 0);
  const hasNext = Boolean(trackIndex < audios.length - 1);

  const playNext = () => {
    if (!hasNext) return;
    setTrackIndex((i) => i + 1);
  };

  const playPrev = () => {
    if (!hasPrev) return;
    setTrackIndex((i) => i - 1);
  };

  const audioUrl = track?.url ?? null;
  const parsedLyrics = parseLyrics(track?.lyrics ?? null);

  const currentLyricIndex = parsedLyrics.findIndex((lyric, index) => {
    const nextLyric = parsedLyrics[index + 1];
    return (
      currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time)
    );
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
    };
  }, [audioUrl]);

  // Autoplay on track change / initial visibility. Uses the play() promise
  // result to set isPlaying instead of optimistically assuming success, so
  // the UI can't get out of sync with the actual audio element state.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (!autoStart && trackIndex === 0) return;

    let cancelled = false;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!cancelled) setIsPlaying(true);
        })
        .catch(() => {
          if (!cancelled) setIsPlaying(false);
        });
    } else {
      setIsPlaying(true);
    }

    return () => {
      cancelled = true;
    };
  }, [autoStart, audioUrl, trackIndex]);

  useEffect(() => {
    if (!lyricsContainerRef.current || currentLyricIndex === -1) return;

    const container = lyricsContainerRef.current;
    const lines = container.querySelectorAll(".lyric-line");
    const activeLine = lines[currentLyricIndex] as HTMLElement | undefined;
    if (activeLine) {
      const targetScrollTop =
        activeLine.offsetTop -
        container.clientHeight / 2 +
        activeLine.clientHeight / 2;

      container.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, [currentLyricIndex]);

  // ---- ColorThief: extract dominant color from the current cover art ----
  useEffect(() => {
    if (!track?.cover_url) {
      setDominantColor(null);
      return;
    }

    let cancelled = false;

    const extract = async () => {
      if (cancelled) return;
      try {
        const coverUrl = track.cover_url;
        if (!coverUrl) {
          setDominantColor(null);
          return;
        }

        const rgb = await extractDominantColor(withColorExtractParam(coverUrl));
        if (!cancelled) {
          setDominantColor(rgb);
        }
      } catch (err) {
        console.error("Failed to extract dominant color:", err);
        if (!cancelled) setDominantColor(null);
      }
    };

    extract();

    return () => {
      cancelled = true;
    };
  }, [track?.cover_url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (hasNext) {
      playNext();
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => setVolume(volume === 0 ? 0.8 : 0);

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const fillPercent = duration ? (currentTime / duration) * 100 : 0;

  const hexToRgba = (hex: string, alpha: number): string => {
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean
        .split("")
        .map((c) => c + c)
        .join("");
    }
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return `rgba(255, 255, 255, ${alpha})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Background: blurred radial wash of the cover's dominant color, sitting
  // on top of the card's existing base color/opacity so the look degrades
  // gracefully before the color is extracted (or if there's no cover art).
  const dominantRgb = rgbStr(dominantColor, "120, 120, 130");
  const ambientGradient = dominantColor
    ? `radial-gradient(circle at 15% 10%, rgba(${dominantRgb}, 0.75), transparent 60%), radial-gradient(circle at 90% 90%, rgba(${dominantRgb}, 0.55), transparent 65%)`
    : undefined;

  return (
    <Card
      className="relative flex flex-col w-full gap-3 p-4 overflow-hidden"
      config={config}
    >
      {/* ambient color wash, blurred, behind everything */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: ambientGradient,
          filter: "blur(10px)",
          opacity: dominantColor ? 1 : 0,
        }}
      />

      {audioUrl && (
        <audio
          key={track?.id}
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={handleEnded}
        />
      )}

      {/* ---- top row: cover + info + progress + controls ---- */}
      <div className="relative z-10 flex flex-row w-full items-center gap-4">
        <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden">
          {track?.cover_url ? (
            <img
              src={track.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <HiMusicalNote
              className="h-full w-full p-3"
              style={{ color: config.text_color }}
            />
          )}
        </div>

        <div className="flex flex-col w-full min-w-0 items-start justify-center gap-1">
          <div className="w-full overflow-hidden">
            <div
              className="text-sm font-semibold line-clamp-1 leading-tight"
              style={{ color: config.text_color }}
            >
              {track?.title}
            </div>
            <p
              className="text-xs line-clamp-1 leading-tight mt-0.5 font-semibold"
              style={{ color: config.text_color, opacity: 0.6 }}
            >
              {track?.artist}
            </p>
          </div>

          <div className="flex w-full items-center gap-2">
            <span
              className="text-xs tabular-nums shrink-0 opacity-60"
              style={{ color: config.text_color }}
            >
              {formatTime(currentTime)}
            </span>

            <div
              className="relative flex-1 h-1 rounded-full cursor-pointer overflow-hidden"
              style={{ backgroundColor: hexToRgba(config.theme_color, 0.2) }}
              onClick={handleSeek}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full pointer-events-none transition-all duration-100"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: config.theme_color,
                }}
              />
            </div>

            <span
              className="text-xs tabular-nums shrink-0 opacity-60"
              style={{ color: config.text_color }}
            >
              {formatTime(duration)}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={playPrev}
                disabled={!hasPrev}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-30 opacity-70 hover:opacity-100"
                style={{
                  color: config.text_color,
                }}
                aria-label="Previous track"
              >
                <FaBackward className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!audioUrl}
                className="p-1.5 rounded-full hover:bg-white/10 transition-all disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  color: config.text_color,
                }}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <FaPause className="w-4 h-4" />
                ) : (
                  <FaPlay className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={playNext}
                disabled={!hasNext}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:cursor-not-allowed disabled:opacity-30 opacity-70 hover:opacity-100"
                style={{
                  color: config.text_color,
                }}
                aria-label="Next track"
              >
                <FaForward className="w-4 h-4" />
              </button>

              <div
                className="flex items-center"
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
              >
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                  style={{
                    color: config.text_color,
                  }}
                  aria-label={volume === 0 ? "Unmute" : "Mute"}
                >
                  {volume === 0 ? (
                    <FaVolumeMute className="w-4 h-4" />
                  ) : (
                    <FaVolumeUp className="w-4 h-4" />
                  )}
                </button>

                <div
                  className="flex items-center transition-all duration-300 ease-out overflow-hidden ml-1"
                  style={{
                    width: showVolume ? "60px" : "0px",
                    opacity: showVolume ? 1 : 0,
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 rounded-full cursor-pointer"
                    style={
                      {
                        background: `linear-gradient(to right, ${config.text_color} 0%, ${config.text_color} ${volume * 100}%, ${config.text_color}30 ${volume * 100}%, ${config.text_color}30 100%)`,
                        WebkitAppearance: "none",
                        appearance: "none",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- bottom: full-width lyrics ---- */}
      {parsedLyrics.length > 0 && (
        <div className="relative z-10 w-full h-[88px] overflow-hidden">
          <div
            ref={lyricsContainerRef}
            className="h-full overflow-hidden px-1 py-[34px] flex flex-col gap-2.5 no-scrollbar"
            style={{ scrollbarWidth: "none" }}
          >
            {currentTime < parsedLyrics[0].time && (
              <div
                className="lyric-line flex items-center gap-1 shrink-0"
                style={{ height: "17px" }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={`dot-${i}`}
                    className="lyric-loading-dot rounded-full"
                    style={{
                      width: "5px",
                      height: "5px",
                      backgroundColor: config.text_color,
                      animation: "lyricDotBounce 1.2s ease-in-out infinite",
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
                <style jsx>{`
                  @keyframes lyricDotBounce {
                    0%,
                    60%,
                    100% {
                      opacity: 0.3;
                      transform: translateY(0);
                    }
                    30% {
                      opacity: 1;
                      transform: translateY(-3px);
                    }
                  }
                `}</style>
              </div>
            )}

            {parsedLyrics.map((lyric, index) => {
              const isActive = currentLyricIndex === index;

              return (
                <div
                  key={`lyric-${index}`}
                  className="lyric-line transition-all duration-300 ease-out whitespace-nowrap overflow-hidden text-ellipsis shrink-0"
                  style={{
                    color: config.text_color,
                    opacity: isActive ? 1 : 0.35,
                    fontSize: isActive ? "15px" : "13px",
                    fontWeight: isActive ? 700 : 500,
                    lineHeight: 1.3,
                  }}
                >
                  {lyric.text}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
