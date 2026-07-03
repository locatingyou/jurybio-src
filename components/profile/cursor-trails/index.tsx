/*
 * Copyright (c) 2025-2026, rose, cupid.wtf
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 */

"use client";

import dynamic from "next/dynamic";

const BubblesTrail = dynamic(
  () => import("./_bubbles").then((mod) => mod.default),
  { ssr: false },
);
const SnowFlakeTrail = dynamic(
  () => import("./_snowflake").then((mod) => mod.default),
  { ssr: false },
);

const RibbonTrail = dynamic(
  () => import("./_ribbon").then((mod) => mod.default),
  { ssr: false },
);

const OnekoTrail = dynamic(
  () => import("./_oneko").then((mod) => mod.default),
  { ssr: false },
);

const GlowTrail = dynamic(() => import("./_glow").then((mod) => mod.default), {
  ssr: false,
});

// yes i thought the title is retarded
const TrailingTrail = dynamic(
  () => import("./_trail").then((mod) => mod.default),
  { ssr: false },
);

export function CursorTrail({
  color,
  trail,
  className,
  cursorImageSrc,
}: {
  color: string;
  trail:
    | "Ribbon"
    | "Oneko"
    | "Glow"
    | "Bubbles"
    | "Snowflakes"
    | "Trail"
    | null;
  className?: string;
  cursorImageSrc?: string;
}) {
  if (!trail) {
    return null;
  }
  let Component;

  switch (trail.toLowerCase()) {
    case "ribbon":
      Component = RibbonTrail;
      break;
    case "bubbles":
      Component = BubblesTrail;
      break;
    case "snowflakes":
      Component = SnowFlakeTrail;
      break;
    case "trail":
      Component = TrailingTrail;
      break;
    case "glow":
      Component = GlowTrail;
      break;
    case "oneko":
      Component = OnekoTrail;
      break;

    case "":
    default:
      throw new Error(`Unknown trail type: ${trail}`);
  }

  return trail ? (
    <Component
      color={color}
      className={className}
      baseImageSrc={cursorImageSrc}
    />
  ) : (
    <Component color={color} className={className} />
  );
}
