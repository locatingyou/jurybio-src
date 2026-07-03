import { Widget } from "./widgets";

export interface Link {
  id: string;
  icon: string;
  url: string;
  type?: string;
  enabled: boolean;
  color?: string;
  position: number;
  glow_color?: string;
}

// this is only used for some things...
interface Account {
  id: string;
  username: string;
  url: string;
  email: string;
  password: string;
  uid: number;
  premium: boolean;
  premium_since: Date | null;
  admin: boolean;
  superadmin: boolean;
  owner: boolean;
  blacklisted: boolean;
  blacklisted_reason: string | null;
  blacklisted_by: string | null;
  blacklisted_at: Date | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  verificationToken: string | null;
  verificationTokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface Profile {
  id: string;
  username: string;
  url: string;
  uid: number;
  blacklisted: boolean;
  blacklisted_reason: string | null;
  blacklisted_by: string | null;
  blacklisted_at: Date | null;
}

interface Config {
  avatar_url: string | null;
  avatar_decoration: string | null;
  avatar_shape: "SQUARE" | "ROUNDED" | "CIRCLE";
  banner_url: string | null;
  description: string | null;
  background_mute: boolean;
  theme_color: string;
  background_color: string;
  background_blur: number;
  background_shuffle: boolean;
  text_color: string;
  secondary_text_color: string;
  username_color: string;
  badge_glow: boolean;
  badge_size: number;
  badge_glow_strength: number;
  badge_color: string;
  badge_monochrome: boolean;
  card_color: string;
  border_color: string;
  card_border_size: number;
  border_radius: "None" | "Small" | "Medium" | "Large" | "XL";
  card_blur: number;
  card_layout: "Stacked" | "Compact" | "Simplistic" | "Portfolio";
  audio_player_layout: "Card" | "Inline" | "Text" | "June";
  card_animation:
    "None" | "Slide Up" | "Slide Down" | "Zoom In" | "Zoom Out" | "Bounce";
  card_width: number;
  card_tilt: boolean;
  card_shine_border: boolean;
  font_family: string;
  // secondary card
  secondary_card_color: string;
  secondary_border_color: string;
  secondary_card_border_size: number;
  secondary_border_radius: "None" | "Small" | "Medium" | "Large" | "XL";
  secondary_font_family: string;
  link_animation:
    | "None"
    | "Fade In"
    | "Slide Up"
    | "Slide Down"
    | "Zoom In"
    | "Zoom Out"
    | "Bounce";
  display_name: string | null;
  location: string | null;
  entry_enabled: boolean;
  entry_text: string | null;
  entry_animation: "Normal" | "Split";
  username_effects: string[];
  cursor_effect: string | null;
  cursor_color: string;
  background_effect: "Silk" | "Plasma" | "Floating_Lines" | "Pillar" | null;
  page_overlays: string[] | null;
  entry_background_color: string;
  meta_title?: string | null;
  meta_description?: string | null;
  backgrounds: {
    id: string;
    title: string;
    url: string;
    file_type: "video" | "image";
    position: number;
  }[];
  widgets: Widget[];
  links: Link[];
  badges: {
    id: string;
    name: string | null;
    icon: string | null;
    icon_url: string | null;
    icon_color: string;
    position: number;
    enabled: boolean;
  }[];
  audios: {
    id: string;
    title: string;
    artist: string | null;
    url: string;
    cover_url: string | null;
    lyrics: string | null;
    position: number;
  }[];
}

export type { Config, Profile, Account };
