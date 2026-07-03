import { getIcon, getColor } from "@/lib/badges";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Config } from "@/lib/types/profile";

// something kept fucking up thx claude :3
function isValidImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function Badges({
  badges,
  config,
}: {
  badges: {
    id: string;
    name: string | null;
    icon: string | null;
    icon_url: string | null;
    icon_color: string;
    position: number;
  }[];
  config: Config;
}) {
  if (!badges?.length) return null;

  const badgeSize = config.badge_size || 20;

  return (
    <div className="flex flex-row gap-2 bg-white/5 border-white/10 backdrop-blur-md border py-2 px-2 rounded-2xl">
      {badges.map((badge) => {
        if (isValidImageUrl(badge.icon_url)) {
          return (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger className="flex justify-center w-fit">
                  <div
                    className="relative flex items-center justify-center shrink-0"
                    style={{
                      width: `${badgeSize}px`,
                      height: `${badgeSize}px`,
                      filter: config.badge_glow
                        ? `drop-shadow(0 0 ${config.badge_glow_strength || 4}px ${config.badge_color || "currentColor"})`
                        : undefined,
                    }}
                  >
                    <Image
                      src={badge.icon_url}
                      alt={badge.name ?? "badge"}
                      fill
                      className="object-contain"
                      style={
                        config.badge_monochrome
                          ? {
                              filter: `brightness(0) saturate(100%) invert(1) sepia(1) saturate(10000%) hue-rotate(0deg)`,
                              colorInterpolation: "sRGB",
                            }
                          : undefined
                      }
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        const Icon = getIcon(badge.icon ?? badge.id);
        let color = badge.icon_color || getColor(badge.icon ?? badge.id);
        if (config.badge_monochrome) {
          color = config.badge_color || color;
        }
        if (!Icon) return null;
        return (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger className="flex justify-center w-fit">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={
                    config.badge_glow
                      ? {
                          filter: `drop-shadow(0 0 ${config.badge_glow_strength || 4}px ${color})`,
                        }
                      : undefined
                  }
                >
                  <Icon size={badgeSize} style={{ color }} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
