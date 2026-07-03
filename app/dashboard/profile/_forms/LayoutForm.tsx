// the original code for this was so shitty i had to get claude to refactor it :sob:
"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconDiscFilled,
  IconLayout2Filled,
  IconMusic,
  IconDeviceAirpods,
} from "@tabler/icons-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSaveBar } from "@/lib/stores/save-bar";
import { Marquee } from "@/components/ui/marquee";

const ACTIVE_CLASS =
  "rounded-md bg-gradient-to-br from-white/[0.055] to-white/[0.02] backdrop-blur-xl border border-white/35 bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
const INACTIVE_CLASS =
  "border border-white/20 hover:border-white/35 hover:bg-white/[0.07]";

type Layout = "Stacked" | "Compact" | "Simplistic" | "Portfolio";
type AudioPlayerLayout = "Card" | "Inline" | "Text" | "June";

const LAYOUTS: {
  id: Layout;
  label: string;
  fullWidth?: boolean;
  render: () => React.ReactNode;
}[] = [
  {
    id: "Stacked",
    label: "Stacked",
    render: () => (
      <div className="h-36 bg-white/10 border border-white/20 max-w-[16rem] w-full rounded-xl flex flex-col items-center justify-center overflow-hidden">
        <div className="rounded-full bg-white/20 size-12 shrink-0" />
        <div className="rounded-full bg-white/20 h-3 w-1/2 mt-1.5" />
        <div className="rounded-full bg-white/20 h-2 w-1/4 mt-1" />
        <div className="rounded-full bg-white/20 h-4 w-1/2 mt-1" />
        <div className="flex gap-2 mt-2">
          <div className="rounded-full bg-white/20 size-4" />
          <div className="rounded-full bg-white/20 size-4" />
          <div className="rounded-full bg-white/20 size-4" />
        </div>
      </div>
    ),
  },
  {
    id: "Compact",
    label: "Compact",
    render: () => (
      <div className="h-36 bg-white/10 border border-white/20 max-w-[16rem] w-full rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden px-3">
        <div className="flex items-center gap-2 w-full">
          <div className="rounded-full bg-white/20 size-10 shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="rounded-full bg-white/20 h-2.5 w-3/4" />
            <div className="rounded-full bg-white/20 h-2 w-1/2" />
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <div className="rounded-md bg-white/20 h-6 flex-1" />
          <div className="rounded-md bg-white/20 h-6 flex-1" />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="rounded-full bg-white/20 size-6" />
          <div className="rounded-full bg-white/20 size-6" />
          <div className="rounded-full bg-white/20 size-6" />
        </div>
      </div>
    ),
  },
  {
    id: "Simplistic",
    label: "Simplistic",
    render: () => (
      <div className="h-36 bg-white/10 border border-white/20 max-w-[16rem] w-full rounded-xl flex flex-col items-start justify-center overflow-hidden px-4">
        <div className="rounded-full bg-white/20 size-12 shrink-0" />
        <div className="rounded-full bg-white/20 h-3 w-1/2 mt-1.5" />
        <div className="rounded-full bg-white/20 h-4 w-full my-2" />
        <div className="flex gap-2">
          <div className="rounded-full bg-white/20 size-5" />
          <div className="rounded-full bg-white/20 size-5" />
          <div className="rounded-full bg-white/20 size-5" />
        </div>
      </div>
    ),
  },
  {
    id: "Portfolio",
    label: "Portfolio",
    fullWidth: true,
    render: () => (
      <div className="h-36 max-w-[20rem] w-full rounded-xl overflow-hidden relative">
        <style jsx>{`
          @keyframes scroll-portfolio {
            0% {
              transform: translateY(0);
            }
            45% {
              transform: translateY(-144px);
            }
            55% {
              transform: translateY(-144px);
            }
            100% {
              transform: translateY(0);
            }
          }
          .animate-scroll-portfolio {
            animation: scroll-portfolio 6s ease-in-out infinite;
          }
        `}</style>
        <div className="absolute inset-0 animate-scroll-portfolio flex flex-col">
          <div className="h-36 shrink-0 flex flex-col items-center justify-center gap-1.5">
            <div className="rounded-full bg-white/20 size-10 shrink-0" />
            <div className="rounded-full bg-white/20 h-2 w-24" />
            <div className="flex gap-1.5 mt-1">
              <div className="rounded-full bg-white/20 size-4" />
              <div className="rounded-full bg-white/20 size-4" />
              <div className="rounded-full bg-white/20 size-4" />
            </div>
          </div>
          <div className="h-36 shrink-0 flex flex-col items-center justify-center gap-1.5 px-4">
            <div className="w-full h-6 rounded-md bg-white/20" />
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <div className="h-6 rounded-md bg-white/20" />
              <div className="h-6 rounded-md bg-white/20" />
              <div className="h-6 rounded-md bg-white/20" />
              <div className="h-6 rounded-md bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

const AUDIO_LAYOUTS: {
  id: AudioPlayerLayout;
  label: string;
  fullWidth?: boolean;
  render: () => React.ReactNode;
}[] = [
  {
    id: "Card",
    label: "Card",
    render: () => (
      <div className="h-16 bg-white/10 border border-white/20 max-w-[16rem] w-full rounded-xl px-4 py-2 flex flex-row gap-2">
        <div className="size-11 shrink-0 flex items-center justify-center bg-white/20 rounded-md" />
        <div className="flex flex-col h-full w-full justify-center">
          <div className="rounded-full bg-white/20 h-2 w-1/2" />
          <div className="rounded-full bg-white/20 h-1.5 w-1/3 mt-1" />
          <div className="flex flex-row items-center gap-1.5 mt-1.5">
            <div className="rounded-full bg-white/20 h-1 flex-[3]" />
            <div className="pl-1 flex gap-1.5">
              <div className="rounded-full bg-white/20 size-3" />
              <div className="rounded-full bg-white/20 size-3" />
              <div className="rounded-full bg-white/20 size-3" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "Inline",
    label: "Inline",
    render: () => (
      <div className="h-16  max-w-[16rem] w-full rounded-xl px-4 py-2 flex flex-row gap-2">
        <div className="size-11 shrink-0 flex items-center justify-center bg-white/20 rounded-md" />
        <div className="flex flex-col h-full w-full justify-center">
          <div className="rounded-full bg-white/20 h-2 w-1/2" />
          <div className="rounded-full bg-white/20 h-1.5 w-1/3 mt-1" />
          <div className="flex flex-row items-center gap-1.5 mt-1.5">
            <div className="rounded-full bg-white/20 h-1 flex-[3]" />
            <div className="pl-1 flex gap-1.5">
              <div className="rounded-full bg-white/20 size-3" />
              <div className="rounded-full bg-white/20 size-3" />
              <div className="rounded-full bg-white/20 size-3" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "Text",
    label: "Text",
    fullWidth: true,
    render: () => <div className="rounded-full bg-white/20 h-1.5 w-1/3" />,
  },
  {
    id: "June",
    label: "June",
    fullWidth: true,
    render: () => (
      <div className="w-60 rounded-xl overflow-hidden bg-white/5 py-2 px-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0 rounded bg-white/20" />
          <div className="flex flex-col flex-1 gap-1">
            <div className="rounded-full bg-white/20 h-2.5 w-1/3" />
            <div className="rounded-full bg-white/20 h-2 w-1/4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-white/20 h-1 flex-1" />
          <div className="flex gap-1.5">
            <div className="rounded-full bg-white/20 size-2" />
            <div className="rounded-full bg-white/20 size-2" />
            <div className="rounded-full bg-white/20 size-2" />
          </div>
        </div>
        <div className="pt-2 flex flex-col gap-1.5">
          <div className="rounded-full bg-white/20 h-3 w-full" />
          <div className="rounded-full bg-white/20 h-3 w-full" />
          <div className="rounded-full bg-white/20 h-3 w-2/3" />
        </div>
      </div>
    ),
  },
];

export default function LayoutForm({
  config,
}: {
  premium?: boolean;
  config: {
    layout: Layout;
    audio_player_layout: AudioPlayerLayout;
  };
}) {
  const { update } = useSaveBar();
  const [layout, setLayout] = useState<Layout>(config.layout);
  const [audioLayout, setAudioLayout] = useState<AudioPlayerLayout>(
    config.audio_player_layout,
  );

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    update({ card_layout: newLayout });
  };

  const handleAudioLayoutChange = (newAudioLayout: AudioPlayerLayout) => {
    setAudioLayout(newAudioLayout);
    update({ audio_player_layout: newAudioLayout });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row gap-1 items-center text-muted-foreground">
          <IconLayout2Filled size={20} />
          <Label className="text-base">Layout</Label>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LAYOUTS.map(({ id, label, fullWidth, render }) => (
              <div
                key={id}
                className={`flex flex-col gap-1.5 ${fullWidth ? "md:col-span-3" : ""}`}
              >
                <Button
                  variant="outline"
                  onClick={() => handleLayoutChange(id)}
                  className={`h-44 rounded-md flex items-center justify-center transition-all duration-[180ms] active:scale-[0.97] ${
                    layout === id ? ACTIVE_CLASS : INACTIVE_CLASS
                  }`}
                >
                  {render()}
                </Button>
                <span className="text-xs text-muted-foreground font-medium text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row gap-1 items-center text-muted-foreground">
          <IconDiscFilled size={20} />
          <Label className="text-base">Audio Player Layout</Label>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AUDIO_LAYOUTS.filter(
              ({ id }) => id !== "June" && id !== "Text",
            ).map(({ id, label, render }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <Button
                  variant="outline"
                  onClick={() => handleAudioLayoutChange(id)}
                  className={`h-20 rounded-md flex items-center justify-center transition-all duration-[180ms] active:scale-[0.97] ${
                    audioLayout === id ? ACTIVE_CLASS : INACTIVE_CLASS
                  }`}
                >
                  {render()}
                </Button>
                <span className="text-xs text-muted-foreground font-medium text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="outline"
              onClick={() => handleAudioLayoutChange("Text")}
              className={`h-20 rounded-md flex items-center justify-center transition-all duration-[180ms] active:scale-[0.97] w-full ${
                audioLayout === "Text" ? ACTIVE_CLASS : INACTIVE_CLASS
              }`}
            >
              {AUDIO_LAYOUTS.find(({ id }) => id === "Text")?.render()}
            </Button>
            <span className="text-xs text-muted-foreground font-medium text-center">
              Text
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="outline"
              onClick={() => handleAudioLayoutChange("June")}
              className={`h-44 rounded-md flex items-center justify-center transition-all duration-[180ms] active:scale-[0.97] w-full ${
                audioLayout === "June" ? ACTIVE_CLASS : INACTIVE_CLASS
              }`}
            >
              {AUDIO_LAYOUTS.find(({ id }) => id === "June")?.render()}
            </Button>
            <span className="text-xs text-muted-foreground font-medium text-center">
              June
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
