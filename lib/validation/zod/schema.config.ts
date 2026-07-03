import { z } from "zod";
import {
  avatarShapeEnum,
  borderRadiusEnum,
  entryAnimationEnum,
  cardLayoutEnum,
  cardAnimationEnum,
  linkAnimationEnum,
  widgetAnimationEnum,
  usernameEffectEnum,
  backgroundEffectEnum,
  pageOverlayEnum,
  cursorEffectEnum,
  audioPlayerLayoutEnum,
  FontFamilyEnum,
} from "./enums";

export const configSchema = z.object({
  avatar_url: z.string().nullable().optional(),
  avatar_decoration: z.string().optional(),
  avatar_shape: avatarShapeEnum.optional(),
  banner_url: z.string().nullable().optional(),
  description: z.string().max(500).optional(),
  background_mute: z.boolean().optional(),
  background_color: z.string().optional(),
  background_blur: z.number().int().min(0).max(100).optional(),
  background_shuffle: z.boolean().optional(),
  background_effect: backgroundEffectEnum.optional().nullable(),
  text_color: z.string().max(50).optional(),
  theme_color: z.string().max(50).optional(),
  secondary_text_color: z.string().max(50).optional(),
  username_color: z.string().optional(),
  username_effect: z.array(usernameEffectEnum).optional(),
  cursor_effect: cursorEffectEnum.nullable().optional(),
  cursor_color: z.string().nullable().optional(),
  page_overlays: z.array(pageOverlayEnum).optional(),
  badge_glow: z.boolean().optional(),
  badge_size: z.number().int().max(100).optional(),
  badge_glow_strength: z.number().max(100).int().optional(),
  badge_color: z.string().optional(),
  badge_monochrome: z.boolean().optional(),
  card_color: z.string().optional(),
  border_color: z.string().optional(),
  card_border_size: z.number().int().min(0).max(10).optional(),
  border_radius: borderRadiusEnum.optional(),
  card_blur: z.number().int().min(0).max(100).optional(),
  card_layout: cardLayoutEnum.optional(),
  audio_player_layout: audioPlayerLayoutEnum.optional(),
  card_animation: cardAnimationEnum.optional(),
  card_width: z.number().int().min(400).max(1500).optional(),
  card_tilt: z.boolean().optional(),
  card_shine_border: z.boolean().optional(),
  font_family: z.string().max(100).optional(),
  secondary_card_color: z.string().optional(),
  secondary_border_color: z.string().optional(),
  secondary_card_border_size: z.number().int().min(0).max(10).optional(),
  secondary_border_radius: borderRadiusEnum.optional(),
  secondary_font_family: z.string().max(100).optional(),
  link_animation: linkAnimationEnum.optional(),
  widget_animation: widgetAnimationEnum.optional(),
  display_name: z.string().max(50).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  entry_enabled: z.boolean().optional(),
  meta_title: z.string().max(255).nullable().optional(),
  meta_description: z.string().max(500).nullable().optional(),
  entry_text: z.string().max(200).nullable().optional(),
  entry_animation: entryAnimationEnum.optional(),
  entry_background_color: z.string().optional(),
  badges: z
    .array(
      z.object({
        id: z.string(),
        icon_color: z.string(),
        position: z.number().int(),
        enabled: z.boolean(),
      }),
    )
    .optional(),
  backgrounds: z
    .array(z.object({ id: z.string(), position: z.number().int() }))
    .optional(),
  widgets: z
    .array(z.object({ id: z.string(), position: z.number().int() }))
    .optional(),
  fonts: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        font_url: z.string(),
        position: z.number().int(),
      }),
    )
    .optional(),
  links: z
    .array(
      z.object({
        id: z.string(),
        position: z.number().int(),
        enabled: z.boolean(),
      }),
    )
    .optional(),
  audios: z
    .array(z.object({ id: z.string(), position: z.number().int() }))
    .optional(),
});
