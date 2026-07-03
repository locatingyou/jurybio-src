"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  IconCircleCheckFilled,
  IconLink,
  IconLockFilled,
  IconTagsFilled,
  IconTextCaption,
  IconUserFilled,
  IconXboxXFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";
import { getIcon, getLimitedBadgeIds, BADGE_CONFIG } from "@/lib/badges";
import { useState } from "react";
import { toast } from "sonner";

const LIMITED_BADGE_ORDER = ["og", "valentines", "christmas", "halloween"];

const LABEL_OVERRIDES: Record<string, string> = {
  og: "OG User",
};

export default function ProfileCompletion({
  is_avatar_uploaded,
  is_links_added,
  is_description_added,
  is_account_connected,
  is_2fa_enabled,
  claimed_badge_ids,
}: {
  is_avatar_uploaded: boolean;
  is_links_added: boolean;
  is_description_added: boolean;
  is_account_connected: boolean;
  is_2fa_enabled: boolean;
  claimed_badge_ids: string[];
}) {
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimedBadges, setClaimedBadges] = useState<string[]>(
    (claimed_badge_ids || []).map((id) => id.toLowerCase()),
  );

  const steps = [
    is_avatar_uploaded,
    is_links_added,
    is_description_added,
    is_account_connected,
    is_2fa_enabled,
  ];
  const completedCount = steps.filter(Boolean).length;
  const progressPercent = (completedCount / steps.length) * 100;

  const limitedBadgeIds = LIMITED_BADGE_ORDER.filter((id) =>
    getLimitedBadgeIds().includes(id),
  );

  const claimedCount = claimedBadges.filter((id) =>
    limitedBadgeIds.includes(id),
  ).length;
  const totalCount = limitedBadgeIds.length;
  const badgeProgressPercent =
    totalCount > 0 ? (claimedCount / totalCount) * 100 : 0;

  async function handleClaimBadge(badgeId: string) {
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
      setClaimedBadges((prev) => [...prev, badgeId]);
    } catch {
      toast.error("An error occurred");
    } finally {
      setClaiming(null);
    }
  }

  return (
    <div className="mt-4 grid grid-cols-1 grid-rows-2 md:grid-cols-3 md:grid-rows-1 gap-4 w-full">
      <Card className="w-full col-span-1 md:col-span-1 flex flex-col">
        <CardHeader className="flex flex-row gap-1 items-center">
          <IconTagsFilled className="text-muted-foreground" size={20} />
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Limited Badges
          </h1>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 flex-1">
          <p className="text-sm text-muted-foreground">
            {claimedCount === totalCount
              ? "You've claimed all available limited badges. Check back later for more!"
              : `You've claimed ${claimedCount} of ${totalCount} limited badges.`}
          </p>

          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-3">
              {limitedBadgeIds.map((id) => {
                const config = BADGE_CONFIG[id];
                if (!config) return null;

                const Icon = getIcon(id);
                const claimed = claimedBadges.includes(id);
                const label = LABEL_OVERRIDES[id] ?? config.name;
                const isClaiming = claiming === id;

                return (
                  <Button
                    key={id}
                    variant="outline"
                    size="lg"
                    className="rounded-full shrink-0 gap-1.5 px-3 mb-2"
                    disabled={claimed || isClaiming}
                    onClick={() => !claimed && handleClaimBadge(id)}
                  >
                    {claimed ? (
                      <IconCircleCheckFilled
                        size={14}
                        className="text-green-400 shrink-0"
                      />
                    ) : (
                      <IconXboxXFilled
                        size={14}
                        className="text-muted-foreground shrink-0"
                      />
                    )}
                    {Icon && <Icon size={14} className="shrink-0" />}
                    <span>{isClaiming ? "Claiming..." : label}</span>
                  </Button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full flex flex-col gap-2.5">
            <p className="text-xs text-muted-foreground text-right">
              {claimedCount} / {totalCount} badges
            </p>
            <div className="w-full h-4 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${badgeProgressPercent}%` }}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
      <Card className="w-full col-span-1 md:col-span-2">
        <CardHeader className="flex flex-row gap-1 items-center">
          <IconUserFilled className="text-muted-foreground" size={20} />
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Profile Completion
          </h1>
        </CardHeader>

        <CardContent className="grid grid-cols-3 gap-1.5 h-full">
          <Button asChild variant="outline" size="lg">
            <Link
              href="/dashboard/profile"
              className="justify-between items-center w-full px-4"
            >
              <div className="w-full flex flex-row items-center gap-1">
                <IconUserFilled size={15} />
                Upload Avatar
              </div>
              {is_avatar_uploaded && (
                <IconCircleCheckFilled className="text-green-400 shrink-0" />
              )}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link
              href="/dashboard/customize?tab=links"
              className="justify-between items-center w-full px-4"
            >
              <div className="w-full flex flex-row items-center gap-1">
                <IconLink size={15} />
                Add Links
              </div>
              {is_links_added && (
                <IconCircleCheckFilled className="text-green-400 shrink-0" />
              )}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link
              href="/dashboard/profile"
              className="justify-between items-center w-full px-4"
            >
              <div className="w-full flex flex-row items-center gap-1">
                <IconTextCaption size={15} />
                Add Description
              </div>
              {is_description_added && (
                <IconCircleCheckFilled className="text-green-400 shrink-0" />
              )}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link
              href="/dashboard/settings"
              className="justify-between items-center w-full px-4"
            >
              <div className="w-full flex flex-row items-center gap-1">
                <FaDiscord size={15} />
                Connect an Account
              </div>
              {is_account_connected && (
                <IconCircleCheckFilled className="text-green-400 shrink-0" />
              )}
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="col-span-2">
            <Link
              href="/dashboard/settings"
              className="justify-between items-center w-full px-4"
            >
              <div className="w-full flex flex-row items-center gap-1">
                <IconLockFilled size={15} />
                Enable 2FA
              </div>
              {is_2fa_enabled && (
                <IconCircleCheckFilled className="text-green-400 shrink-0" />
              )}
            </Link>
          </Button>
        </CardContent>

        <CardFooter>
          <div className="w-full flex flex-col gap-2.5">
            <p className="text-xs text-muted-foreground text-right">
              {completedCount} / {steps.length} completed
            </p>
            <div className="w-full h-4 rounded-2xl bg-muted overflow-hidden">
              <div
                className="h-full rounded-2xl bg-primary transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
