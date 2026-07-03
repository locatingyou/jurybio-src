"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IconBoltFilled, IconSettings } from "@tabler/icons-react";
import {
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
  ComboboxBadges,
} from "@/components/ui/combobox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Config } from "@/lib/types/profile";
import { useSaveBar } from "@/lib/stores/save-bar";
import { ColorPicker } from "../_components/ColorPicker";

const SPARKLE_PREVIEWS: Record<string, string> = {
  "Blue Sparkles": "/username_effects/sparkles_blue.gif",
  "White Sparkles": "/username_effects/sparkles_white.gif",
  "Black Sparkles": "/username_effects/sparkles_black.gif",
  "Pink Sparkles": "/username_effects/sparkles_pink.webp",
  "Purple Sparkles": "/username_effects/sparkles_purple.gif",
  "Rainbow Sparkles": "/username_effects/sparkles_rainbow.gif",
};

const USERNAME_EFFECTS = [
  "Glow",
  "Rainbow",
  "Shimmer",
  "Typewriter",
  "Blue Sparkles",
  "White Sparkles",
  "Black Sparkles",
  "Pink Sparkles",
  "Purple Sparkles",
  "Rainbow Sparkles",
];

const CURSOR_EFFECTS = [
  "Ribbon",
  "Trail",
  "Oneko",
  "Bubbles",
  "Snowflakes",
  "Glow",
] as const;

const BACKGROUND_EFFECTS = [
  "Silk",
  "Plasma",
  "Floating_Lines",
  "Pillar",
] as const;

const PAGE_OVERLAYS = ["Shooting Stars"] as const;

const BACKGROUND_EFFECT_LABELS: Record<string, string> = {
  Floating_Lines: "Floating Lines",
};

export default function PageEffects({
  premium,
  config,
}: {
  premium: boolean;
  config: Config;
}) {
  const { update } = useSaveBar();

  const toggle = (
    key: keyof Config,
    current: string | string[],
    effect: string,
  ) => {
    let next: string | string[];
    if (key === "cursor_effect") {
      next = current === effect ? "" : effect;
    } else if (!premium) {
      next = [effect];
    } else if ((current as string[]).includes(effect)) {
      next = (current as string[]).filter((e) => e !== effect);
    } else if ((current as string[]).length >= 3) {
      return;
    } else {
      next = [...(current as string[]), effect];
    }
    update({ [key]: next });
  };

  const remove = (key: keyof Config, current: string[], effect: string) => {
    update({ [key]: current.filter((e) => e !== effect) });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center text-muted-foreground">
        <div className="flex">
          <IconBoltFilled size={20} />
          <Label className="text-base ml-1">Effects</Label>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconSettings />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-1">
                <IconBoltFilled size={20} />
                Effect Settings
              </DialogTitle>
            </DialogHeader>
            {config.cursor_effect ? (
              <div className="flex flex-col gap-3">
                <Label className="text-[14px]">Cursor Color</Label>
                <ColorPicker
                  type="hex"
                  color={config.cursor_color}
                  onChange={(v) => update({ cursor_color: v })}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No configurable settings for your current effects.
              </p>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid grid-rows-2 grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3">
          <Label className="text-[14px]">Name</Label>
          <ComboboxRoot>
            <ComboboxTrigger>
              <ComboboxBadges
                values={(config.username_effects ?? []).slice(0, 2)}
                onRemove={(e) =>
                  remove("username_effects", config.username_effects ?? [], e)
                }
                placeholder="None"
              />
              {(config.username_effects?.length ?? 0) > 2 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  +{config.username_effects!.length - 2}
                </span>
              )}
            </ComboboxTrigger>
            <ComboboxContent>
              {USERNAME_EFFECTS.map((effect) => (
                <ComboboxItem
                  key={effect}
                  selected={config.username_effects?.includes(effect)}
                  onClick={() =>
                    toggle(
                      "username_effects",
                      config.username_effects ?? [],
                      effect,
                    )
                  }
                >
                  {SPARKLE_PREVIEWS[effect] ? (
                    <span className="flex items-center gap-2">
                      <Image
                        src={SPARKLE_PREVIEWS[effect]}
                        alt=""
                        width={16}
                        height={16}
                        className="object-cover pointer-events-none"
                        style={{ mixBlendMode: "screen" }}
                        unoptimized
                      />
                      {effect}
                    </span>
                  ) : (
                    effect
                  )}
                </ComboboxItem>
              ))}
            </ComboboxContent>
          </ComboboxRoot>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-[14px]">Cursor</Label>
          <Select
            value={config.cursor_effect ?? "none"}
            onValueChange={(value) => {
              if (value === "none") {
                update({ cursor_effect: null });
                return;
              }
              const match = CURSOR_EFFECTS.find((e) => e === value);
              if (match) update({ cursor_effect: match });
            }}
          >
            <SelectTrigger className="!py-0 !h-8 w-full !rounded-xl">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="none">None</SelectItem>
              {CURSOR_EFFECTS.map((effect) => (
                <SelectItem key={effect} value={effect}>
                  {effect}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <Label className="text-[14px]">Background</Label>
          <Select
            value={config.background_effect ?? "none"}
            onValueChange={(value) => {
              if (value === "none") {
                update({ background_effect: null });
                return;
              }
              const match = BACKGROUND_EFFECTS.find((e) => e === value);
              if (match) update({ background_effect: match });
            }}
          >
            <SelectTrigger className="!py-0 !h-8 w-full !rounded-xl">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="none">None</SelectItem>
              {BACKGROUND_EFFECTS.map((effect) => (
                <SelectItem key={effect} value={effect}>
                  {BACKGROUND_EFFECT_LABELS[effect] ?? effect}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3 col-span-3">
          <Label className="text-[14px]">Overlay</Label>
          <ComboboxRoot>
            <ComboboxTrigger>
              <ComboboxBadges
                values={(config.page_overlays ?? []).slice(0, 2)}
                onRemove={(e) =>
                  remove("page_overlays", config.page_overlays ?? [], e)
                }
                placeholder="None"
              />
              {(config.page_overlays?.length ?? 0) > 2 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  +{config.page_overlays!.length - 2}
                </span>
              )}
            </ComboboxTrigger>
            <ComboboxContent>
              {PAGE_OVERLAYS.map((overlay) => (
                <ComboboxItem
                  key={overlay}
                  selected={config.page_overlays?.includes(overlay)}
                  onClick={() =>
                    toggle("page_overlays", config.page_overlays ?? [], overlay)
                  }
                >
                  {overlay}
                </ComboboxItem>
              ))}
            </ComboboxContent>
          </ComboboxRoot>
        </div>
      </CardContent>
    </Card>
  );
}
