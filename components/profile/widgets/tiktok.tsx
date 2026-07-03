"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaExternalLinkAlt,
  FaUserFriends,
  FaHeart,
  FaVideo,
} from "react-icons/fa";
import type { Widget } from "@/lib/types/widgets";
import { MdVerified } from "react-icons/md";
import { FaUser } from "react-icons/fa6";

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

function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface TikTokWidgetProps {
  widget: Pick<
    Widget,
    | "identifier"
    | "tiktok_show_followers"
    | "tiktok_show_following"
    | "tiktok_show_likes"
    | "tiktok_show_videos"
    | "tiktok_show_verified"
    | "show_button"
  >;
  textColor?: string;
  secondaryTextColor?: string;
}

const DEFAULT_IDENTIFIER = "tiktok";

export default function TikTokWidget({
  widget,
  textColor = "#ffffff",
  secondaryTextColor = "rgba(255,255,255,0.6)",
}: TikTokWidgetProps) {
  const identifier = widget.identifier || DEFAULT_IDENTIFIER;
  const [profile, setProfile] = useState<TikTokProfile | null>(null);

  useEffect(() => {
    fetch(`/api/tiktok/${identifier.replace(/^@/, "")}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.data) setProfile(j.data);
      })
      .catch(() => {});
  }, [identifier]);

  if (!profile) return null;

  const stats: { label: string; value: string; icon: React.ReactNode }[] = [];
  if (widget.tiktok_show_followers)
    stats.push({
      label: "followers",
      value: formatCount(profile.followers),
      icon: <FaUserFriends className="h-3 w-3 shrink-0" />,
    });
  if (widget.tiktok_show_following)
    stats.push({
      label: "following",
      value: formatCount(profile.following),
      icon: <FaUserFriends className="h-3 w-3 shrink-0" />,
    });
  if (widget.tiktok_show_likes)
    stats.push({
      label: "likes",
      value: formatCount(profile.likes),
      icon: <FaHeart className="h-3 w-3 shrink-0" />,
    });
  if (widget.tiktok_show_videos)
    stats.push({
      label: "videos",
      value: formatCount(profile.videoCount),
      icon: <FaVideo className="h-3 w-3 shrink-0" />,
    });

  return (
    <section className="flex flex-row items-center justify-between w-full h-full min-w-0">
      <div className="flex flex-row items-center min-w-0">
        <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-white/5">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FaUser size={20} className="text-white/60" />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center ml-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1
              style={{ color: textColor }}
              className="text-sm font-semibold truncate"
            >
              {profile.displayName}
            </h1>
            {widget.tiktok_show_verified && profile.verified && (
              <MdVerified className="text-blue-400" />
            )}
          </div>

          {stats.length > 0 && (
            <p
              style={{ color: secondaryTextColor }}
              className="text-xs flex flex-row items-center gap-2"
            >
              {stats.map((s) => (
                <span
                  key={s.label}
                  className="flex items-center gap-1.5 truncate"
                >
                  {s.icon}
                  {s.value} {s.label}
                </span>
              ))}
            </p>
          )}

          {widget.show_button && (
            <Link
              className="text-xs flex flex-row gap-2 items-center text-black bg-white justify-center rounded-xl py-0.5 px-2 mt-1 w-fit"
              href={profile.profileUrl}
              target="_blank"
            >
              View Profile <FaExternalLinkAlt />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
