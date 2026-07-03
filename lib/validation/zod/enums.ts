import { z } from "zod";

export const avatarShapeEnum = z.enum(["SQUARE", "ROUNDED", "CIRCLE"]);
export const borderRadiusEnum = z.enum([
  "None",
  "Small",
  "Medium",
  "Large",
  "XL",
]);
export const entryAnimationEnum = z.enum(["Normal", "Split"]);
export const cardLayoutEnum = z.enum([
  "Stacked",
  "Compact",
  "Simplistic",
  "Portfolio",
]);
export const audioPlayerLayoutEnum = z.enum(["Card", "Inline", "Text", "June"]);
export const cardAnimationEnum = z.enum([
  "None",
  "Slide Up",
  "Slide Down",
  "Zoom In",
  "Zoom Out",
  "Bounce",
]);
export const linkAnimationEnum = z.enum([
  "None",
  "Fade In",
  "Slide Up",
  "Slide Down",
  "Zoom In",
  "Zoom Out",
  "Bounce",
]);
export const widgetAnimationEnum = z.enum([
  "None",
  "Fade In",
  "Slide Up",
  "Slide Down",
]);

export const usernameEffectEnum = z.enum([
  "None",
  "Glow",
  "Gradient",
  "Rainbow",
  "Shimmer",
  "Glitch",
  "Wave",
  "Typewriter",
  "Blue Sparkles",
  "White Sparkles",
  "Black Sparkles",
  "Pink Sparkles",
  "Purple Sparkles",
  "Rainbow Sparkles",
]);

export const bioEffectEnum = z.enum([
  "None",
  "Glow",
  "Gradient",
  "Shimmer",
  "Typewriter",
  "Fade In",
]);

export const backgroundEffectEnum = z.enum([
  "Silk",
  "Plasma",
  "Floating_Lines",
  "Pillar",
]);

export const pageOverlayEnum = z.enum(["Shooting Stars"]);

export const cursorEffectEnum = z.enum([
  "None",
  "Trail",
  "Sparkle",
  "Snow",
  "Glow",
  "Bubbles",
  "Ribbon",
  "Oneko",
]);

export const FontFamilyEnum = z.enum([
  "Sora",
  "Chillax",
  "Array",
  "Minecraft",
  "Iceberg",
  "DancingScript",
  "JetBrainsMono",
  "ComicSans",
  "Jersey",
  "Lora",
  "Cinzel",
  "Facon",
  "werebeast",
]);

export type AvatarShape = z.infer<typeof avatarShapeEnum>;
export type BorderRadius = z.infer<typeof borderRadiusEnum>;
export type EntryAnimation = z.infer<typeof entryAnimationEnum>;
export type CardLayout = z.infer<typeof cardLayoutEnum>;
export type CardAnimation = z.infer<typeof cardAnimationEnum>;
export type LinkAnimation = z.infer<typeof linkAnimationEnum>;
export type WidgetAnimation = z.infer<typeof widgetAnimationEnum>;
export type UsernameEffect = z.infer<typeof usernameEffectEnum>;
export type BioEffect = z.infer<typeof bioEffectEnum>;
export type BackgroundEffect = z.infer<typeof backgroundEffectEnum>;
export type PageOverlay = z.infer<typeof pageOverlayEnum>;
export type CursorEffect = z.infer<typeof cursorEffectEnum>;
