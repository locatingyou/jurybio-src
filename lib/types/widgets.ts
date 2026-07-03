interface Widget {
  id: string;
  platform: "weather" | "discord" | "spotify" | "lastfm" | "tiktok";
  type: string;
  identifier: string;
  // weather
  weather_show_feels_like: boolean;
  weather_temperature_unit: "celsius" | "fahrenheit";
  weather_show_location: boolean;
  weather_show_condition: boolean;
  // discord
  discord_show_badges: boolean;
  discord_show_guild_tag: boolean;
  discord_show_avatar_decoration: boolean;
  discord_show_activity: boolean;
  discord_show_status: boolean;
  // spotify (now playing)
  spotify_show_artist: boolean;
  spotify_show_progress: boolean;
  lastfm_mode: "now_playing" | "profile";
  // lastfm - now_playing mode only
  lastfm_show_artist: boolean;
  lastfm_show_album: boolean;
  // lastfm - profile mode only
  lastfm_show_scrobbles: boolean;
  lastfm_show_artists: boolean;
  // tiktok
  tiktok_show_followers: boolean;
  tiktok_show_following: boolean;
  tiktok_show_likes: boolean;
  tiktok_show_videos: boolean;
  tiktok_show_verified: boolean;
  show_button: boolean;
  position: number;
  enabled: boolean;
}
export type { Widget };
