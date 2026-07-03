"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getIcon, getColor, BADGE_CONFIG } from "@/lib/badges";
import { IoCheckmark, IoHeart } from "react-icons/io5";
import { FaBug, FaFire, FaSpinner } from "react-icons/fa6";
import { BiLinkExternal } from "react-icons/bi";
import { FaTrophy } from "react-icons/fa";
import { RiMistLine } from "react-icons/ri";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useSetAtom } from "jotai";
import { configAtom } from "@/lib/stores/save-bar";
import { Config } from "@/lib/types/profile";

const BADGE_ORDER = [
  "owner",
  "manager",
  "staff",
  "helper",
  "og",
  "verified",
  "bug_hunter",
  "donator",
  "premium",
  "champion",
  "booster",
  "winner",
  "gifter",
  "guild_tag",
  "halloween",
  "christmas",
  "easter",
  "valentines",
];

function getActionIcon(id: string) {
  switch (id) {
    case "verified":
      return <IoCheckmark size={16} />;
    case "bug_hunter":
      return <FaBug size={16} />;
    case "donator":
      return <IoHeart size={16} />;
    case "champion":
    case "booster":
      return <FaFire size={16} />;
    default:
      return <BiLinkExternal size={16} />;
  }
}

function BadgeIcon({
  id,
  color,
  size = 28,
}: {
  id: string;
  color: string;
  size?: number;
}) {
  const Icon = getIcon(id);
  if (id === "champion") {
    return (
      <div className="flex flex-col items-center">
        <RiMistLine size={14} style={{ color }} className="-mb-1" />
        <FaTrophy size={24} style={{ color }} />
      </div>
    );
  }
  if (!Icon) return null;
  return <Icon style={{ color }} size={size} />;
}

export default function AvailableBadges({
  badges,
}: {
  badges: Config["badges"];
}) {
  const setConfig = useSetAtom(configAtom);
  const [claiming, setClaiming] = useState<string | null>(null);

  const ownedSet = new Set(badges.map((b) => b.icon));

  async function handleClaim(badgeId: string) {
    setClaiming(badgeId);
    try {
      const res = await fetch("/api/badges/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badge_id: badgeId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          typeof data.error === "string" ? data.error : "Failed to claim badge",
        );
        return;
      }
      toast.success(`${BADGE_CONFIG[badgeId]?.name ?? "Badge"} claimed!`);
      setConfig((prev) => ({ ...prev, badges: [...prev.badges, data.badge] }));
    } catch {
      toast.error("An error occurred");
    } finally {
      setClaiming(null);
    }
  }

  return (
    <main className="w-full mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Available badges</h1>
        <p className="text-sm text-muted-foreground">
          View badges you can earn on jury, and claim the ones you qualify for.
        </p>
      </div>

      {/* All badges grid */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">
          All badges
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {BADGE_ORDER.map((id) => {
            const config = BADGE_CONFIG[id];
            if (!config) return null;

            const color = getColor(id);
            const owned = ownedSet.has(id);
            const isClaiming = claiming === id;

            return (
              <div
                key={id}
                className={`border border-white/5 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/80 transition-colors rounded-2xl p-4 flex flex-row items-center justify-between gap-4 ${owned ? "border-white/10 ring-1 ring-white/5" : ""}`}
              >
                <div className="flex flex-row items-center gap-3 overflow-hidden">
                  <div className="shrink-0 flex items-center justify-center w-10">
                    <BadgeIcon
                      id={id}
                      color={owned ? color : `${color}55`}
                      size={id === "premium" ? 24 : 28}
                    />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                      {config.name}
                      {config.limited && (
                        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          Limited
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground/70 truncate">
                      {config.description}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-2 shrink-0">
                  {owned ? (
                    <div
                      className="flex items-center gap-1 border px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ borderColor: `${color}40`, color }}
                    >
                      <IoCheckmark size={12} /> Owned
                    </div>
                  ) : config.actionType === "unavailable" ? (
                    <div className="border border-red-900/30 text-red-500/50 bg-transparent px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap">
                      {config.actionText}
                    </div>
                  ) : config.actionType === "obtained" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground text-xs px-3 gap-1.5"
                      onClick={() => handleClaim(id)}
                      disabled={isClaiming}
                    >
                      {isClaiming ? (
                        <FaSpinner className="animate-spin" size={12} />
                      ) : (
                        <IoCheckmark size={14} />
                      )}
                      {isClaiming ? "Claiming..." : "Claim"}
                    </Button>
                  ) : config.actionType === "link" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground text-xs px-3 gap-1.5"
                    >
                      {getActionIcon(id)} {config.actionText}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground text-xs px-3 gap-1.5"
                    >
                      {getActionIcon(id)} {config.actionText}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
