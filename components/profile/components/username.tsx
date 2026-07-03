import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "motion/react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Image from "next/image";

type UsernameEffect =
  | "Glow"
  | "Shimmer"
  | "Rainbow"
  | "Loading"
  | "Typewriter"
  | "Blue Sparkles"
  | "White Sparkles"
  | "Black Sparkles"
  | "Pink Sparkles"
  | "Purple Sparkles"
  | "Rainbow Sparkles";

const effectImageFiles: Partial<Record<UsernameEffect, string>> = {
  "Blue Sparkles": "sparkles_blue.gif",
  "White Sparkles": "sparkles_white.gif",
  "Black Sparkles": "sparkles_black.gif",
  "Pink Sparkles": "sparkles_pink.webp",
  "Purple Sparkles": "sparkles_purple.gif",
  "Rainbow Sparkles": "sparkles_rainbow.gif",
};

const hasEffectImage = (e: UsernameEffect) => e in effectImageFiles;
const getEffectImageUrl = (e: UsernameEffect) => {
  const f = effectImageFiles[e];
  return f ? `/username_effects/${f}` : null;
};

export default function Username({
  username,
  text_color,
  uid,
  username_effects = [],
  fontType = "none",
}: {
  username: string;
  text_color: string;
  uid: number;
  username_effects?: UsernameEffect[];
  fontType?: "bold" | "italic" | "none";
}) {
  const has = (e: UsernameEffect) => username_effects.includes(e);

  const getFontClass = () => {
    const base = "text-3xl text-center break-words select-none";
    if (fontType === "bold") return `${base} font-bold`;
    if (fontType === "italic") return `${base} italic`;
    return `${base} font-bold`;
  };

  const textShadowStyle = has("Glow")
    ? `0 0 5px ${text_color}, 0 0 16.5px ${text_color}, 0 0 0px ${text_color}`
    : "none";

  const buildStyle = (): React.CSSProperties => {
    if (has("Shimmer")) {
      return {
        textShadow: textShadowStyle,
        background: `linear-gradient(90deg, transparent, ${text_color}, transparent)`,
        backgroundSize: "200% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: `${text_color}40`,
        animation: "shining 5s linear infinite",
      };
    }
    return { textShadow: textShadowStyle, color: text_color };
  };

  const buildClassName = () => {
    const cls = getFontClass();
    if (has("Rainbow")) return `${cls} rainbow-effect`;
    if (has("Loading")) return `${cls} animate-loading`;
    return cls;
  };

  const renderUsername = () => {
    if (has("Typewriter")) {
      return (
        <TypingAnimation
          className={buildClassName()}
          style={buildStyle()}
          duration={100}
          loop
        >
          {username}
        </TypingAnimation>
      );
    }

    const imageEffect = username_effects.find(hasEffectImage);
    if (imageEffect) {
      return (
        <motion.div className="relative w-fit mx-auto">
          <Image
            src={getEffectImageUrl(imageEffect)!}
            alt=""
            width={0}
            height={0}
            className="absolute h-full w-full object-cover"
            style={{ color: "transparent" }}
            unoptimized
          />
          <h1
            className={`relative w-fit bg-transparent ${buildClassName()}`}
            style={buildStyle()}
          >
            {username}
          </h1>
        </motion.div>
      );
    }

    return (
      <motion.h1 className={buildClassName()} style={buildStyle()}>
        {username}
      </motion.h1>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex justify-center w-fit">
          {renderUsername()}
        </TooltipTrigger>
        <TooltipContent>
          <p>UID: {uid}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
