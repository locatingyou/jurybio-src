"use client";

import { HiMusicalNote } from "react-icons/hi2";
import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { Config } from "@/lib/types/profile";

export default function TextAudioPlayer({
  config,
  autoStart = false,
}: {
  autoStart?: boolean;
  config: Config;
}) {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audios = config.audios ?? [];
  const track = audios[trackIndex];
  const hasNext = Boolean(trackIndex < audios.length - 1);

  const audioUrl = track?.url ?? null;

  useEffect(() => {
    setIsPlaying(false);
  }, [trackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;
    if (!autoStart && trackIndex === 0) return;

    if (trackIndex > 0 || autoStart) {
      audio.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  }, [autoStart, audioUrl, trackIndex]);

  const handleEnded = () => {
    if (hasNext) {
      setTrackIndex((i) => i + 1);
    } else {
      setIsPlaying(false);
    }
  };

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

  return (
    <>
      {audioUrl && (
        <audio
          key={track?.id}
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onEnded={handleEnded}
        />
      )}

      <button
        onClick={togglePlay}
        disabled={!audioUrl}
        className="shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
      >
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          <HiMusicalNote
            className="w-4 h-4 shrink-0"
            style={{ color: config.theme_color }}
          />
          <span
            className="text-sm font-semibold truncate max-w-[200px]"
            style={{ color: `${config.text_color}` }}
          >
            {track?.artist}
          </span>
          -
          <span
            className="text-sm font-semibold truncate max-w-[200px]"
            style={{ color: `${config.text_color}80` }}
          >
            {track?.title}
          </span>
        </div>
      </button>
    </>
  );
}
