import { db } from "@/db";
import {
  usersTable,
  configsTable,
  backgroundsTable,
  aliasesTable,
  widgetsTable,
  linksTable,
  audiosTable,
  badgesTable,
  fontsTable,
} from "@/db/schemas";
import { eq, or } from "drizzle-orm";

export async function getProfile({ url }: { url: string }) {
  // Determine the user's ID by checking their primary url or any of their aliases
  const userMatch = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .leftJoin(aliasesTable, eq(aliasesTable.userId, usersTable.id))
    .where(
      or(
        eq(usersTable.url, url),
        eq(usersTable.username, url),
        eq(aliasesTable.alias, url),
      ),
    )
    .limit(1);

  if (!userMatch.length) return null;
  const targetUserId = userMatch[0].id;

  const [profile] = await db
    .select({
      id: usersTable.id,
      uid: usersTable.uid,
      username: usersTable.username,
      url: usersTable.url,
      premium: usersTable.premium,
      blacklisted: usersTable.blacklisted,
      blacklisted_reason: usersTable.blacklisted_reason,
      blacklisted_by: usersTable.blacklisted_by,
      blacklisted_at: usersTable.blacklisted_at,
      config: {
        avatar_url: configsTable.avatar_url,
        banner_url: configsTable.banner_url,
        avatar_decoration: configsTable.avatar_decoration,
        avatar_shape: configsTable.avatar_shape,
        description: configsTable.description,
        display_name: configsTable.display_name,
        location: configsTable.location,
        background_mute: configsTable.background_mute,
        background_color: configsTable.background_color,
        background_blur: configsTable.background_blur,
        background_shuffle: configsTable.background_shuffle,
        text_color: configsTable.text_color,
        secondary_text_color: configsTable.secondary_text_color,
        username_color: configsTable.username_color,
        username_effects: configsTable.username_effects,
        page_overlays: configsTable.page_overlays,
        cursor_effect: configsTable.cursor_effect,
        cursor_color: configsTable.cursor_color,
        theme_color: configsTable.theme_color,
        badge_glow: configsTable.badge_glow,
        badge_color: configsTable.badge_color,
        badge_size: configsTable.badge_size,
        badge_glow_strength: configsTable.badge_glow_strength,
        badge_monochrome: configsTable.badge_monochrome,
        card_color: configsTable.card_color,
        card_border_size: configsTable.card_border_size,
        card_blur: configsTable.card_blur,
        card_layout: configsTable.card_layout,
        card_animation: configsTable.card_animation,
        audio_player_layout: configsTable.audio_player_layout,
        audio_player_position: configsTable.audio_player_position,
        secondary_card_color: configsTable.secondary_card_color,
        secondary_border_color: configsTable.secondary_border_color,
        secondary_card_border_size: configsTable.secondary_card_border_size,
        secondary_border_radius: configsTable.secondary_border_radius,
        secondary_font_family: configsTable.secondary_font_family,
        card_width: configsTable.card_width,
        card_tilt: configsTable.card_tilt,
        card_shine_border: configsTable.card_shine_border,
        border_color: configsTable.border_color,
        border_radius: configsTable.border_radius,
        background_effect: configsTable.background_effect,
        font_family: configsTable.font_family,
        link_animation: configsTable.link_animation,
        entry_enabled: configsTable.entry_enabled,
        entry_text: configsTable.entry_text,
        entry_animation: configsTable.entry_animation,
        entry_background_color: configsTable.entry_background_color,
        meta_title: configsTable.meta_title,
        meta_description: configsTable.meta_description,
      },
    })
    .from(usersTable)
    .innerJoin(configsTable, eq(configsTable.userId, usersTable.id))
    .where(eq(usersTable.id, targetUserId));

  if (!profile) return null;

  const backgrounds = await db
    .select({
      id: backgroundsTable.id,
      title: backgroundsTable.title,
      url: backgroundsTable.background_url,
      file_type: backgroundsTable.file_type,
      position: backgroundsTable.position,
    })
    .from(backgroundsTable)
    .where(eq(backgroundsTable.userId, targetUserId))
    .orderBy(backgroundsTable.position);

  if (profile.config.background_shuffle) {
    backgrounds.sort(() => Math.random() - 0.5);
  }

  const widgets = await db
    .select()
    .from(widgetsTable)
    .where(eq(widgetsTable.userId, targetUserId))
    .orderBy(widgetsTable.position);

  const links = await db
    .select({
      id: linksTable.id,
      icon: linksTable.icon,
      url: linksTable.url,
      color: linksTable.color,
      enabled: linksTable.enabled,
      position: linksTable.position,
    })
    .from(linksTable)
    .where(eq(linksTable.userId, targetUserId))
    .orderBy(linksTable.position);

  const audios = await db
    .select({
      id: audiosTable.id,
      title: audiosTable.title,
      artist: audiosTable.artist,
      lyrics: audiosTable.lyrics,
      url: audiosTable.url,
      cover_url: audiosTable.cover_url,
      position: audiosTable.position,
    })
    .from(audiosTable)
    .where(eq(audiosTable.userId, targetUserId))
    .orderBy(audiosTable.position);

  const badges = await db
    .select({
      id: badgesTable.id,
      name: badgesTable.name,
      icon: badgesTable.icon,
      icon_url: badgesTable.icon_url,
      icon_color: badgesTable.icon_color,
      position: badgesTable.position,
      enabled: badgesTable.enabled,
    })
    .from(badgesTable)
    .where(eq(badgesTable.userId, targetUserId))
    .orderBy(badgesTable.position);

  const fonts = await db
    .select({
      id: fontsTable.id,
      title: fontsTable.title,
      font_url: fontsTable.font_url,
      position: fontsTable.position,
    })
    .from(fontsTable)
    .where(eq(fontsTable.userId, targetUserId))
    .orderBy(fontsTable.position);

  const completeConfig = {
    ...profile.config,
    backgrounds,
    widgets,
    links,
    audios,
    badges,
    fonts,
  };
  return { ...profile, config: completeConfig };
}
