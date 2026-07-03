"use client";
import { motion } from "motion/react";
import { CSSProperties } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tilt } from "./tilt";
import { cn } from "@/lib/utils";

export default function Card({
  className,
  children,
  config,
}: {
  children: React.ReactNode;
  className?: string;
  config: {
    card_width: number;
    card_tilt: boolean;
    card_shine_border: boolean;
    card_color: string;
    border_color: string;
    card_border_size: number;
    border_radius: "None" | "Small" | "Medium" | "Large" | "XL";
    card_blur: number;
  };
}) {
  const isMobile = useIsMobile();

  const borderRadiusClass =
    config.border_radius === "None"
      ? "rounded-none"
      : config.border_radius === "Small"
        ? "rounded-md"
        : config.border_radius === "Medium"
          ? "rounded-xl"
          : config.border_radius === "Large"
            ? "rounded-2xl"
            : config.border_radius === "XL"
              ? "rounded-3xl"
              : "rounded-none";

  const cardStyle: CSSProperties = {
    background: config.card_color,
    borderWidth: config.card_shine_border
      ? "0px"
      : `${config.card_border_size}px`,
    borderColor: config.card_shine_border ? "transparent" : config.border_color,
    width: "100%",
    maxWidth: `${config.card_width}px`,
    WebkitBackdropFilter: `blur(${config.card_blur}px)`,
    backdropFilter: `blur(${config.card_blur}px)`,
  };

  const cardContent = (
    <div
      className={cn(
        "p-4 flex flex-col relative w-full isolate overflow-hidden",
        borderRadiusClass,
        className,
      )}
      style={cardStyle}
    >
      {children}
    </div>
  );

  if (config.card_tilt && !isMobile) {
    return (
      <Tilt
        tiltMaxAngle={10}
        transitionSpeed={0.5}
        enableLayers={false}
        style={{
          width: "100%",
          maxWidth: `${config.card_width}px`,
        }}
      >
        {cardContent}
      </Tilt>
    );
  }

  return cardContent;
}

export function SecondaryCard({
  config,
  children,
  className,
}: {
  config: {
    secondary_card_color: string;
    secondary_border_color: string;
    secondary_card_border_size: number;
    // we'll add secondary later :3
    border_radius: "None" | "Small" | "Medium" | "Large" | "XL";
  };
  children: React.ReactNode;
  className?: string;
}) {
  const cardStyle: CSSProperties = {
    background: config.secondary_card_color,
    borderWidth: config.secondary_card_border_size,
    borderColor: config.secondary_border_color,
    width: "100%",
    WebkitBackdropFilter: `inherit`,
    backdropFilter: `inherit`,
  };
  const borderRadiusClass =
    config.border_radius === "None"
      ? "rounded-none"
      : config.border_radius === "Small"
        ? "rounded-md"
        : config.border_radius === "Medium"
          ? "rounded-xl"
          : config.border_radius === "Large"
            ? "rounded-2xl"
            : config.border_radius === "XL"
              ? "rounded-3xl"
              : "rounded-none";
  return (
    <>
      <div
        className={cn(
          "flex flex-col relative w-full overflow-hidden ",
          className,
          borderRadiusClass,
        )}
        style={cardStyle}
      >
        {children}
      </div>
    </>
  );
}
