import {
  FaDiscord,
  FaEnvelope,
  FaFacebook,
  FaGithub,
  FaGitlab,
  FaInstagram,
  FaLinkedin,
  FaMastodon,
  FaMedium,
  FaPatreon,
  FaPinterest,
  FaReddit,
  FaSnapchat,
  FaSoundcloud,
  FaSpotify,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaTwitch,
  FaVimeoV,
  FaWhatsapp,
  FaX,
  FaXTwitter,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa6";
import {
  SiApplemusic,
  SiBinance,
  SiBitcoin,
  SiBitcoincash,
  SiBluesky,
  SiBuymeacoffee,
  SiCardano,
  SiCashapp,
  SiDogecoin,
  SiEthereum,
  SiKick,
  SiKofi,
  SiLastdotfm,
  SiLitecoin,
  SiMonero,
  SiPaypal,
  SiPlaystation,
  SiPolkadot,
  SiPolygon,
  SiRipple,
  SiRoblox,
  SiSolana,
  SiSteam,
  SiStellar,
  SiTether,
  SiVk,
  SiZcash,
} from "react-icons/si";
import type { IconType } from "react-icons";

// --- Old, untouched: icon-only lookup, used wherever you just need the icon ---
export function getIcon(platform: string): IconType | null {
  switch (platform.toLowerCase()) {
    case "custom":
      return FaGlobe;
    case "x":
    case "twitter":
      return FaXTwitter;
    case "telegram":
      return FaTelegram;
    case "youtube":
      return FaYoutube;
    case "github":
      return FaGithub;
    case "gitlab":
      return FaGitlab;
    case "spotify":
      return FaSpotify;
    case "threads":
      return FaThreads;
    case "tiktok":
      return FaTiktok;
    case "soundcloud":
      return FaSoundcloud;
    case "discord":
      return FaDiscord;
    case "instagram":
      return FaInstagram;
    case "facebook":
      return FaFacebook;
    case "linkedin":
      return FaLinkedin;
    case "reddit":
      return FaReddit;
    case "twitch":
      return FaTwitch;
    case "pinterest":
      return FaPinterest;
    case "snapchat":
      return FaSnapchat;
    case "whatsapp":
      return FaWhatsapp;
    case "mastodon":
      return FaMastodon;
    case "medium":
      return FaMedium;
    case "patreon":
      return FaPatreon;
    case "email":
      return FaEnvelope;
    case "vimeo":
      return FaVimeoV;
    case "paypal":
      return SiPaypal;
    case "cashapp":
      return SiCashapp;
    case "playstation":
      return SiPlaystation;
    case "applemusic":
      return SiApplemusic;
    case "vk":
      return SiVk;
    case "steam":
      return SiSteam;
    case "kick":
      return SiKick;
    case "lastfm":
      return SiLastdotfm;
    case "buymeacoffee":
      return SiBuymeacoffee;
    case "kofi":
      return SiKofi;
    case "bluesky":
      return SiBluesky;
    case "roblox":
      return SiRoblox;
    case "bitcoin":
      return SiBitcoin;
    case "ethereum":
      return SiEthereum;
    case "binance":
      return SiBinance;
    case "solana":
      return SiSolana;
    case "ripple":
      return SiRipple;
    case "cardano":
      return SiCardano;
    case "dogecoin":
      return SiDogecoin;
    case "polkadot":
      return SiPolkadot;
    case "polygon":
      return SiPolygon;
    case "litecoin":
      return SiLitecoin;
    case "stellar":
      return SiStellar;
    case "monero":
      return SiMonero;
    case "zcash":
      return SiZcash;
    case "tether":
      return SiTether;
    case "bitcoincash":
      return SiBitcoincash;
    default:
      return null;
  }
}

export type PlatformType = {
  label: string;
  prefix: string;
};

export type PlatformConfig = {
  prefix?: string;
  types?: PlatformType[];
};

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  custom: { prefix: "https://" },
  snapchat: { prefix: "snapchat.com/add/" },
  youtube: { prefix: "youtube.com/@" },
  discord: {
    types: [
      { label: "Server", prefix: "discord.gg/" },
      { label: "User", prefix: "discord.com/users/" },
    ],
  },
  spotify: {
    types: [
      { label: "User", prefix: "open.spotify.com/user/" },
      { label: "Artist", prefix: "open.spotify.com/artist/" },
      { label: "Playlist", prefix: "open.spotify.com/playlist/" },
      { label: "Track", prefix: "open.spotify.com/track/" },
      { label: "Album", prefix: "open.spotify.com/album/" },
    ],
  },
  instagram: { prefix: "instagram.com/" },
  x: { prefix: "x.com/" },
  tiktok: { prefix: "tiktok.com/@" },
  telegram: { prefix: "t.me/" },
  soundcloud: { prefix: "soundcloud.com/" },
  paypal: { prefix: "paypal.me/" },
  github: { prefix: "github.com/" },
  cashapp: { prefix: "cash.app/$" },
  vimeo: { prefix: "vimeo.com/" },
  playstation: { prefix: "psnprofiles.com/" },
  AppleMusic: { prefix: "music.apple.com/profile/" },
  gitlab: { prefix: "gitlab.com/" },
  twitch: { prefix: "twitch.tv/" },
  reddit: { prefix: "reddit.com/user/" },
  vk: { prefix: "vk.com/" },
  bluesky: { prefix: "bsky.app/profile/" },
  linkedin: { prefix: "linkedin.com/in/" },
  steam: { prefix: "steamcommunity.com/id/" },
  kick: { prefix: "kick.com/" },
  pinterest: { prefix: "pinterest.com/" },
  lastfm: { prefix: "last.fm/user/" },
  buymeacoffee: { prefix: "buymeacoffee.com/" },
  kofi: { prefix: "ko-fi.com/" },
  facebook: { prefix: "facebook.com/" },
  threads: { prefix: "threads.net/@" },
  patreon: { prefix: "patreon.com/" },
  bitcoin: { prefix: "" },
  ethereum: { prefix: "" },
  litecoin: { prefix: "" },
  monero: { prefix: "" },
  email: { prefix: "mailto:" },
};

export function getColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case "custom":
      return "#FFFFFF";
    case "snapchat":
      return "#FFFC00";
    case "youtube":
      return "#FF0000";
    case "discord":
      return "#5865F2";
    case "spotify":
      return "#1ED760";
    case "x":
    case "twitter":
    case "tiktok":
    case "threads":
    case "github":
    case "stellar":
    case "roblox":
      return "#FFFFFF";
    case "instagram":
      return "#E4405F";
    case "telegram":
      return "#26A5E4";
    case "soundcloud":
      return "#FF5500";
    case "paypal":
      return "#003087";
    case "cashapp":
      return "#00D632";
    case "vimeo":
      return "#1AB7EA";
    case "playstation":
      return "#003791";
    case "applemusic":
      return "#FA243C";
    case "gitlab":
      return "#FC6D26";
    case "twitch":
      return "#9146FF";
    case "reddit":
      return "#FF4500";
    case "vk":
      return "#0077FF";
    case "bluesky":
      return "#1185FE";
    case "linkedin":
      return "#0A66C2";
    case "steam":
      return "#1B2838";
    case "kick":
      return "#53FC18";
    case "pinterest":
      return "#BD081C";
    case "lastfm":
      return "#D51007";
    case "buymeacoffee":
      return "#FFDD00";
    case "kofi":
      return "#FF5E5B";
    case "facebook":
      return "#1877F2";
    case "patreon":
      return "#FF424D";
    case "bitcoin":
      return "#F7931A";
    case "ethereum":
      return "#3C3C3D";
    case "binance":
      return "#F0B90B";
    case "solana":
      return "#14F195";
    case "ripple":
      return "#23292F";
    case "cardano":
      return "#0033AD";
    case "dogecoin":
      return "#C2A633";
    case "polkadot":
      return "#E6007A";
    case "polygon":
      return "#8247E5";
    case "litecoin":
      return "#345D9D";
    case "monero":
      return "#FF6600";
    case "zcash":
      return "#F4B728";
    case "tether":
      return "#26A17B";
    case "bitcoincash":
      return "#8DC351";
    case "mastodon":
      return "#6364FF";
    case "medium":
      return "#000000";
    case "whatsapp":
      return "#25D366";
    case "email":
      return "#7B8794";
    default:
      return "#FFFFFF";
  }
}
