"use client";

import Image from "next/image";
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

export default function InlineAudioPlayer({
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
        console.log("Duration from effect:", audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);

    return () => {
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
    };
  }, [audioUrl]);

  useEffect(() => {
    console.log(
      "fillPercent calc - duration:",
      duration,
      "currentTime:",
      currentTime,
    );
  }, [duration, currentTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (!autoStart && trackIndex === 0) return;

    if (trackIndex > 0 || autoStart) {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
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

  const cardOpacity =
    (config as any).background_opacity ??
    (config as any).card_opacity ??
    (config as any).bg_opacity ??
    1;

  const fadeSolid = config.background_color
    ? hexToRgba(config.background_color, cardOpacity)
    : "rgba(0, 0, 0, 0)";
  const fadeClear = config.background_color
    ? hexToRgba(config.background_color, 0)
    : "rgba(0, 0, 0, 0)";

  return (
    <div className="relative flex flex-row w-full items-stretch gap-4 min-h-[80px]">
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
      <div
        className={`relative flex flex-row flex-[2] min-w-0 items-center gap-4 ${
          parsedLyrics.length > 0 ? "max-w-[420px]" : "w-full"
        }`}
      >
        <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden">
          {track?.cover_url ? (
            <Image
              src={track.cover_url}
              alt="Cover"
              fill
              className="object-cover"
            />
          ) : (
            <HiMusicalNote
              className="h-full w-full p-3"
              style={{ color: config.text_color }}
            />
          )}
        </div>

        <div className="flex flex-col w-full items-start justify-center overflow-hidden">
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

      {parsedLyrics.length > 0 && (
        <div className="relative flex-1 min-w-[100px] h-[88px] overflow-hidden">
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
                    fontSize: "13px",
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
    </div>
  );
}
