import { FaBug, FaDiscord } from "react-icons/fa6";
import { PiCrownSimpleFill } from "react-icons/pi";
import { AiFillDollarCircle } from "react-icons/ai";
import { GiButterfly, GiPumpkinLantern, GiCarrot } from "react-icons/gi";
import { MdVerified } from "react-icons/md";
import { IoHeart } from "react-icons/io5";
import {
  FaFire,
  FaTrophy,
  FaGift,
  FaTag,
  FaTools,
  FaGem,
} from "react-icons/fa";
import { TbChristmasTreeFilled } from "react-icons/tb";
import { FaLightbulb, FaShield } from "react-icons/fa6";
import type { IconType } from "react-icons";

export function getIcon(badge: string): IconType | null {
  switch (badge.toLowerCase()) {
    case "owner":
      return PiCrownSimpleFill;
    case "manager":
      return FaShield;
    case "staff":
      return FaTools;
    case "helper":
      return FaLightbulb;
    case "og":
    case "og_users":
      return GiButterfly;
    case "verified":
      return MdVerified;
    case "bug_hunter":
      return FaBug;
    case "donator":
      return AiFillDollarCircle;
    case "premium":
      return FaGem;
    case "champion":
      return FaTrophy;
    case "booster":
      return FaFire;
    case "winner":
      return FaTrophy;
    case "gifter":
      return FaGift;
    case "guild_tag":
      return FaTag;
    case "halloween":
      return GiPumpkinLantern;
    case "christmas":
      return TbChristmasTreeFilled;
    case "easter":
      return GiCarrot;
    case "valentines":
      return IoHeart;
    case "discord_link":
      return FaDiscord;
    default:
      return null;
  }
}

export type BadgeActionType = "unavailable" | "link" | "button" | "obtained";

export type BadgeConfig = {
  name: string;
  description: string;
  color: string;
  actionType: BadgeActionType;
  actionText?: string;
  hasSettings?: boolean;
  limited?: boolean;
};

export const BADGE_CONFIG: Record<string, BadgeConfig> = {
  owner: {
    name: "Chief Justice",
    description: "Be a part of the jury.lat owner team.",
    color: "#8b5cf6",
    actionType: "unavailable",
    actionText: "Not available",
  },
  manager: {
    name: "Mangement",
    description: "Be a part of the jury.lat manager team.",
    color: "#ef4444",
    actionType: "unavailable",
    actionText: "Not available",
  },
  staff: {
    name: "Moderator",
    description: "Be a part of the jury.lat staff team.",
    color: "#3b82f6",
    actionType: "unavailable",
    actionText: "Not available",
  },
  helper: {
    name: "Helper",
    description: "Be a part of the jury.lat helper team.",
    color: "#f59e0b",
    actionType: "unavailable",
    actionText: "Not available",
  },
  og: {
    name: "OG",
    description: "Be an early user of jury.lat.",
    color: "#eab308",
    actionType: "obtained",
    limited: true,
  },
  verified: {
    name: "Verified",
    description: "Purchase or be a known content creator.",
    color: "#38bdf8",
    actionType: "button",
    actionText: "Apply",
  },
  bug_hunter: {
    name: "Bug Hunter",
    description: "Report a bug to the jury.lat team.",
    color: "#22c55e",
    actionType: "button",
    actionText: "Report a bug",
  },
  donator: {
    name: "Donator",
    description: "Awarded for donating to jury.lat.",
    color: "#4ade80",
    actionType: "button",
    actionText: "Donate",
    hasSettings: true,
  },
  premium: {
    name: "Premium",
    description: "Purchase the premium package.",
    color: "#a855f7",
    actionType: "link",
    actionText: "Get Premium",
  },
  champion: {
    name: "Champion",
    description: "Reach the top 10 on the profile views leaderboard.",
    color: "#eab308",
    actionType: "unavailable",
    actionText: "Not available",
  },
  booster: {
    name: "Booster",
    description: "Boost the jury.lat discord server.",
    color: "#f97316",
    actionType: "link",
    actionText: "Join Discord",
  },
  winner: {
    name: "Winner",
    description: "Win a jury.lat event.",
    color: "#facc15",
    actionType: "link",
    actionText: "See events",
  },
  gifter: {
    name: "Gifter",
    description: "Awarded for gifting jury.lat products to others.",
    color: "#ef4444",
    actionType: "button",
    actionText: "Send a gift",
    hasSettings: true,
  },
  guild_tag: {
    name: "Guild Tag",
    description: "Obtain our guild tag on the jury.lat discord server.",
    color: "#d97706",
    actionType: "link",
    actionText: "Open Discord",
  },
  halloween: {
    name: "Halloween",
    description: "Exclusive badge claimable only during Halloween.",
    color: "#ea580c",
    actionType: "obtained",
    hasSettings: true,
    limited: true,
  },
  christmas: {
    name: "Christmas",
    description: "Exclusive badge claimable only during Christmas.",
    color: "#ef4444",
    actionType: "obtained",
    hasSettings: true,
    limited: true,
  },
  easter: {
    name: "Easter",
    description: "Exclusive badge claimable only during Easter.",
    color: "#f472b6",
    actionType: "obtained",
    hasSettings: true,
    limited: true,
  },
  valentines: {
    name: "Valentines",
    description: "Exclusive badge claimable only during Valentine's Day.",
    color: "#fb7185",
    actionType: "obtained",
    hasSettings: true,
    limited: true,
  },
};

export function getColor(badge: string): string {
  return BADGE_CONFIG[badge.toLowerCase()]?.color ?? "#FFFFFF";
}

export function getLimitedBadgeIds(): string[] {
  return Object.entries(BADGE_CONFIG)
    .filter(([, config]) => config.limited)
    .map(([id]) => id);
}
