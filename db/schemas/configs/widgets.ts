import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { usersTable } from "../account/user";
export const widgetPlatformEnum = pgEnum("widget_platform", [
  "weather",
  "discord",
  "spotify",
  "lastfm",
  "tiktok",
]);
export const temperatureUnitEnum = pgEnum("temperature_unit", [
  "celsius",
  "fahrenheit",
]);
export const lastfmModeEnum = pgEnum("lastfm_mode", ["now_playing", "profile"]);
export const widgetsTable = pgTable("widgets", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  platform: widgetPlatformEnum().notNull(),
  type: text().notNull(),
  identifier: text().notNull(),
  // weather
  weather_show_feels_like: boolean().notNull().default(false),
  weather_temperature_unit: temperatureUnitEnum().notNull().default("celsius"),
  weather_show_location: boolean().notNull().default(true),
  weather_show_condition: boolean().notNull().default(true),
  // discord
  discord_show_badges: boolean().notNull().default(true),
  discord_show_guild_tag: boolean().notNull().default(true),
  discord_show_avatar_decoration: boolean().notNull().default(true),
  discord_show_activity: boolean().notNull().default(true),
  discord_show_status: boolean().notNull().default(true),
  // spotify (now playing)
  spotify_show_artist: boolean().notNull().default(true),
  spotify_show_progress: boolean().notNull().default(true),
  // lastfm (now_playing or profile, see lastfm_mode)
  lastfm_mode: lastfmModeEnum().notNull().default("now_playing"),
  // lastfm - now_playing mode only
  lastfm_show_artist: boolean().notNull().default(true),
  lastfm_show_album: boolean().notNull().default(true),
  // lastfm - profile mode only
  lastfm_show_scrobbles: boolean().notNull().default(true),
  lastfm_show_artists: boolean().notNull().default(true),
  // tiktok
  tiktok_show_followers: boolean().notNull().default(true),
  tiktok_show_following: boolean().notNull().default(false),
  tiktok_show_likes: boolean().notNull().default(true),
  tiktok_show_videos: boolean().notNull().default(false),
  tiktok_show_verified: boolean().notNull().default(true),
  show_button: boolean().notNull().default(true),
  position: integer().notNull().default(0),
  enabled: boolean().notNull().default(true),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
