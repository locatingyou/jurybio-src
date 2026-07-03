import {
  pgTable,
  varchar,
  text,
  timestamp,
  pgEnum,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";

export const avatarShapeEnum = pgEnum("avatar_shape", [
  "SQUARE",
  "ROUNDED",
  "CIRCLE",
]);
// export const borderStyleEnum = pgEnum("border_style", ["solid", "dotted", "dashed", ""]); <- might come back later. not needed imo
export const borderRadiusEnum = pgEnum("border_radius", [
  "None",
  "Small",
  "Medium",
  "Large",
  "XL",
]);
export const entryAnimationEnum = pgEnum("entry_animation", [
  "Normal",
  "Split",
]);
export const cardLayoutEnum = pgEnum("card_layout", [
  "Stacked",
  "Compact",
  "Simplistic",
  "Portfolio",
]);
export const audioPlayerLayoutEnum = pgEnum("audio_player_layout", [
  "Card",
  "Inline",
  "Text",
  // "june.lat #ad #promo layout use junebot #promo #ad #notsponsored"
  "June",
]);
export const audioPlayerPositionEnum = pgEnum("audio_player_position", [
  "Top",
  "Bottom",
]);
export const cardAnimationEnum = pgEnum("card_animation", [
  "None",
  "Slide Up",
  "Slide Down",
  "Zoom In",
  "Zoom Out",
  "Bounce",
]);
export const linkAnimationEnum = pgEnum("link_animation", [
  "None",
  "Fade In",
  "Slide Up",
  "Slide Down",
  "Zoom In",
  "Zoom Out",
  "Bounce",
]);
export const widgetAnimationEnum = pgEnum("widget_animation", [
  "None",
  "Fade In",
  "Slide Up",
  "Slide Down",
]);
export const BackgroundEffectsEnum = pgEnum("background_effect", [
  "Silk",
  "Plasma",
  "Floating_Lines",
  "Pillar",
]);

export const configsTable = pgTable("configs", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  // Profile
  avatar_url: text(),
  avatar_decoration: text(),
  avatar_shape: avatarShapeEnum().notNull().default("CIRCLE"),
  banner_url: text(),
  description: varchar({ length: 500 }),
  // background
  background_mute: boolean().notNull().default(false),
  background_color: text().notNull().default("rgba(0, 0, 0)"),
  background_blur: integer().notNull().default(0),
  background_shuffle: boolean().notNull().default(false),
  // extra color idk
  theme_color: text().notNull().default("#ffffff"),
  text_color: text().notNull().default("#ffffff"),
  secondary_text_color: text().notNull().default("#ffffff"),
  username_color: text().notNull().default("#ffffff"),
  //effects
  username_effects: text().array().notNull().default([]),
  // cursor
  cursor_effect: text().default(""),
  cursor_color: text().notNull().default("#ffffff"),
  background_effect: BackgroundEffectsEnum(),
  page_overlays: text().array().default([]),
  // badge options
  badge_glow: boolean().notNull().default(false),
  badge_size: integer().notNull().default(20),
  badge_glow_strength: integer().notNull().default(0),
  badge_color: text().notNull().default("#ffffff"),
  badge_monochrome: boolean().notNull().default(false),
  // Card options
  card_color: text().notNull().default("rgba(21, 21, 21, 1)"),
  border_color: text().notNull().default("rgba(255, 255, 255, 1)"),
  card_border_size: integer().notNull().default(1),
  border_radius: borderRadiusEnum().notNull().default("Medium"),
  card_blur: integer().notNull().default(0),
  card_layout: cardLayoutEnum().notNull().default("Stacked"),
  audio_player_layout: audioPlayerLayoutEnum().notNull().default("Card"),
  audio_player_position: audioPlayerPositionEnum().notNull().default("Bottom"),
  card_animation: cardAnimationEnum().notNull().default("Slide Up"),
  card_width: integer().notNull().default(500),
  card_tilt: boolean().notNull().default(false),
  card_shine_border: boolean().notNull().default(false),
  font_family: text().notNull().default("Chillax"),
  // secondary card
  secondary_card_color: text().notNull().default("rgba(255, 255, 255, 0.5)"),
  secondary_border_color: text().notNull().default("rgba(255, 255, 255, 0.1)"),
  secondary_card_border_size: integer().notNull().default(1),
  secondary_border_radius: borderRadiusEnum().notNull().default("Medium"),
  secondary_font_family: text().notNull().default("Roboto"),
  // animations
  link_animation: linkAnimationEnum().notNull().default("Zoom In"),
  widget_animation: widgetAnimationEnum().notNull().default("None"),
  // Extra details
  display_name: text(),
  location: text(),
  // Entry screen
  entry_enabled: boolean().notNull().default(true),
  entry_text: text(),
  entry_animation: entryAnimationEnum().notNull().default("Normal"),
  entry_background_color: text().notNull().default("rgba(0, 0, 0, 0.5)"),
  meta_title: text(),
  meta_description: text(),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
