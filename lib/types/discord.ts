export interface DiscordEmoji {
  name: string;
  id: string | null;
  animated: boolean;
  url: string | null;
}

export interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  discriminator: string;
  bot: boolean;
  system: boolean;
  avatar: string | null;
  banner: string | null;
  accentColor: number | null;
  bannerColor: number | null;
  avatarDecoration: string | null;
  publicFlags: number;
}

export interface DiscordClan {
  guildId: string;
  enabled: boolean;
  tag: string;
  badge: string;
}

export interface DiscordMember {
  nickname: string | null;
  displayName: string | null;
  joinedAt: string;
}

export interface CustomStatus {
  text: string;
  createdTimestamp: number;
  emoji: DiscordEmoji | null;
}

export interface PresenceStatus {
  status: "online" | "idle" | "dnd" | "invisible";
  clientStatus: {
    desktop?: "online" | "idle" | "dnd";
    mobile?: "online" | "idle" | "dnd";
    web?: "online" | "idle" | "dnd";
  } | null;
  description: CustomStatus | null;
}

export interface ActivityTimestamps {
  start: number | null;
  end: number | null;
}

export interface ActivityParty {
  id: string;
  size: [number, number] | null;
}

export interface ActivityAssets {
  largeImage: string | null;
  largeText: string | null;
  smallImage: string | null;
  smallText: string | null;
}

export interface Activity {
  name: string;
  type:
    "Playing" | "Streaming" | "Listening" | "Watching" | "Custom" | "Competing";
  details: string | null;
  state: string | null;
  url: string | null;
  applicationId: string | null;
  createdTimestamp: number;
  timestamps: ActivityTimestamps | null;
  party: ActivityParty | null;
  assets: ActivityAssets | null;
  emoji: DiscordEmoji | null;
  buttons: string[];
  syncId: string | null;
  sessionId: string | null;
  flags: string[];
}

export interface DiscordPresenceData {
  user: DiscordUser;
  clan: DiscordClan | null;
  member: DiscordMember | null;
  status: PresenceStatus | null;
  activities: Activity[];
}
