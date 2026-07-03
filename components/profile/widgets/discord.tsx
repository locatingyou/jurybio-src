import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DiscordPresenceData, Activity } from "@/lib/types/discord";
import Link from "next/link";
import { FaUser } from "react-icons/fa6";

const ACTIVITY_TYPE_MAP: Record<Activity["type"], string> = {
  Playing: "Playing",
  Streaming: "Streaming",
  Listening: "Listening to",
  Watching: "Watching",
  Competing: "Competing in",
  Custom: "",
};

interface DiscordWidgetOptions {
  showBadges?: boolean;
  showGuildTag?: boolean;
  showAvatarDecoration?: boolean;
  showActivity?: boolean;
  showStatus?: boolean;
}

interface DiscordWidgetProps {
  discordId?: string;
  options?: DiscordWidgetOptions;
  textColor?: string;
  secondaryTextColor?: string;
}

const DEFAULT_OPTIONS: Required<DiscordWidgetOptions> = {
  showBadges: true,
  showGuildTag: true,
  showAvatarDecoration: true,
  showActivity: true,
  showStatus: true,
};

export default function DiscordWidget({
  discordId = "1358306603547496619",
  textColor = "#ffffff",
  secondaryTextColor = "rgba(255,255,255,0.6)",
  options,
}: DiscordWidgetProps = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [discordData, setDiscordData] = useState<DiscordPresenceData | null>(
    null,
  );
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/discord/${discordId}`)
      .then((res) => res.json())
      .then((json) => setDiscordData(json.data));
  }, [discordId]);

  useEffect(() => {
    if (!opts.showActivity || !discordData?.activities.length) return;

    const interval = setInterval(() => {
      setCurrentActivityIndex(
        (prev) => (prev + 1) % discordData.activities.length,
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [discordData?.activities.length, opts.showActivity]);

  if (!discordData) return null;

  const { user, clan, activities, status } = discordData;
  const currentActivity = opts.showActivity
    ? activities[currentActivityIndex]
    : undefined;

  const getStatusDisplay = () => {
    if (opts.showStatus && status?.description?.text) {
      return {
        text: status.description.text,
        emoji: status.description.emoji?.url,
      };
    }

    if (currentActivity) {
      const typeText =
        ACTIVITY_TYPE_MAP[currentActivity.type] || currentActivity.type;

      return {
        text: `${typeText} ${currentActivity.name}`,
        emoji: currentActivity.emoji?.url,
      };
    }

    return {
      text: status?.status || "offline",
      emoji: null,
    };
  };

  const statusDisplay = getStatusDisplay();
  const showStatusLine = opts.showStatus || opts.showActivity;

  return (
    <section className="flex flex-row items-center justify-between w-full h-full min-w-0">
      <div className="flex flex-row items-center min-w-0">
        <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt="discord avatar"
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FaUser size={20} className="text-white/60" />
            </div>
          )}
          {opts.showAvatarDecoration && user.avatarDecoration && (
            <Image
              src={user.avatarDecoration}
              alt="decoration"
              fill
              sizes="56px"
              className="pointer-events-none z-30 scale-[1.2]"
            />
          )}
        </div>
        <div className="flex flex-col justify-center gap-1 ml-3 min-w-0">
          <div className="flex flex-row items-center gap-2 min-w-0">
            <h1
              style={{ color: textColor }}
              className="text-sm font-semibold truncate"
            >
              {user.globalName}
            </h1>
            {opts.showGuildTag && clan?.enabled && (
              <div
                style={{ color: textColor }}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1 py-0.5 text-xs font-medium text-white/90"
              >
                <img
                  src={clan.badge}
                  draggable={false}
                  className="size-3"
                  alt="clan badge"
                />
                {clan.tag}
              </div>
            )}
          </div>
          {showStatusLine && (
            <div
              style={{ color: secondaryTextColor }}
              className="text-xs flex flex-row items-center gap-1 min-w-0"
            >
              {opts.showStatus &&
                status?.description?.emoji &&
                status.description.emoji.url && (
                  <img
                    src={status.description.emoji.url}
                    draggable={false}
                    className="size-4 shrink-0"
                    alt="emotion"
                  />
                )}
              <AnimatePresence mode="wait">
                <motion.span
                  key={`text-${currentActivityIndex}`}
                  className="truncate"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {statusDisplay.text}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">
        {opts.showActivity && currentActivity?.assets?.largeImage && (
          <motion.div
            key={`activity-${currentActivityIndex}`}
            className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={currentActivity.assets.largeImage}
                  alt={currentActivity.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {ACTIVITY_TYPE_MAP[currentActivity.type] ||
                    currentActivity.type}{" "}
                  {currentActivity.name}
                </p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
