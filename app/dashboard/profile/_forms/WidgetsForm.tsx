"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSaveBar } from "@/lib/stores/save-bar";
import DiscordWidget from "@/components/profile/widgets/discord";
import LastfmWidget from "@/components/profile/widgets/lastfm";
import TikTokWidget from "@/components/profile/widgets/tiktok";
import WeatherWidget from "@/components/profile/widgets/weather";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Widget } from "@/lib/types/widgets";
import {
  IconDotsVertical,
  IconEdit,
  IconEditFilled,
  IconGripVertical,
  IconLayoutGridFilled,
  IconPlus,
  IconTrashFilled,
} from "@tabler/icons-react";
import { FaDiscord, FaCloudSun } from "react-icons/fa";
import { FaSpinner } from "react-icons/fa6";
import { SiLastdotfm, SiTiktok } from "react-icons/si";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Platform = "discord" | "lastfm" | "tiktok" | "weather";
type LastfmMode = "now_playing" | "profile";

type DiscordOptions = {
  showBadges: boolean;
  showGuildTag: boolean;
  showAvatarDecoration: boolean;
  showActivity: boolean;
  showStatus: boolean;
};

type TiktokOptions = {
  showVerified: boolean;
  showFollowers: boolean;
  showFollowing: boolean;
  showLikes: boolean;
  showVideos: boolean;
};

type LastfmOptions = {
  mode: LastfmMode;
  showArtist: boolean;
  showAlbum: boolean;
  showScrobbles: boolean;
  showArtists: boolean;
};

type TemperatureUnit = "celsius" | "fahrenheit";

type WeatherOptions = {
  showFeelsLike: boolean;
  temperatureUnit: TemperatureUnit;
  showLocation: boolean;
  showCondition: boolean;
};

type ToggleConfig = {
  key: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (value: boolean) => void;
};

const PLATFORMS: { value: Platform; label: string; icon: React.ReactNode }[] = [
  {
    value: "discord",
    label: "Discord",
    icon: <FaDiscord className="h-4 w-4 shrink-0" />,
  },
  {
    value: "lastfm",
    label: "Last.fm",
    icon: <SiLastdotfm className="h-4 w-4 shrink-0" />,
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: <SiTiktok className="h-4 w-4 shrink-0" />,
  },
  {
    value: "weather",
    label: "Weather",
    icon: <FaCloudSun className="h-4 w-4 shrink-0" />,
  },
];

const MAX_WIDGETS = 4;

const DEFAULT_IDENTIFIERS: Record<Platform, string> = {
  discord: "1358306603547496619",
  lastfm: "paw2k",
  tiktok: "tiktok",
  weather: "Atlanta, GA",
};

const DEFAULT_DISCORD: DiscordOptions = {
  showBadges: true,
  showGuildTag: true,
  showAvatarDecoration: true,
  showActivity: true,
  showStatus: true,
};

const DEFAULT_TIKTOK: TiktokOptions = {
  showVerified: true,
  showFollowers: true,
  showFollowing: true,
  showLikes: true,
  showVideos: true,
};

const DEFAULT_LASTFM: LastfmOptions = {
  mode: "now_playing",
  showArtist: true,
  showAlbum: true,
  showScrobbles: true,
  showArtists: true,
};

const DEFAULT_WEATHER: WeatherOptions = {
  showFeelsLike: false,
  temperatureUnit: "celsius",
  showLocation: true,
  showCondition: true,
};

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-w-[200px] max-w-[260px] flex-1 basis-[200px] items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <Label>{label}</Label>
        <p className="text-muted-foreground text-sm leading-snug">
          {description}
        </p>
      </div>
      <Switch
        className="mt-0.5 shrink-0"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function SortableWidgetRow({
  widget,
  renderWidget,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  renderWidget: (widget: Widget) => React.ReactNode;
  onEdit: (widget: Widget) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex items-center gap-2 rounded-2xl border border-white/5 bg-card/25 px-4 py-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab rounded-md p-1.5 text-white/40 transition-colors hover:text-white active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <IconGripVertical className="h-4 w-4" />
      </button>
      <div className="flex min-h-20 w-full items-center justify-center rounded-xl bg-linear-to-b from-bg-card to-black/70 border-white/10 border px-4 py-3">
        {renderWidget(widget)}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="shrink-0 rounded-md p-1.5 text-white/40 transition-colors hover:text-white">
            <IconDotsVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onEdit(widget)}>
              <IconEditFilled /> Edit Widget
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(widget.id)}
              variant="destructive"
            >
              <IconTrashFilled /> Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function EditWidgetDialog({
  widget,
  open,
  onOpenChange,
  onSaved,
}: {
  widget: Widget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [identifier, setIdentifier] = useState(widget.identifier);
  const [showButton, setShowButton] = useState(widget.show_button);
  const [saving, setSaving] = useState(false);

  const [discord, setDiscord] = useState<DiscordOptions>({
    showBadges: widget.discord_show_badges ?? true,
    showGuildTag: widget.discord_show_guild_tag ?? true,
    showAvatarDecoration: widget.discord_show_avatar_decoration ?? true,
    showActivity: widget.discord_show_activity ?? true,
    showStatus: widget.discord_show_status ?? true,
  });
  const [tiktok, setTiktok] = useState<TiktokOptions>({
    showVerified: widget.tiktok_show_verified ?? true,
    showFollowers: widget.tiktok_show_followers ?? true,
    showFollowing: widget.tiktok_show_following ?? true,
    showLikes: widget.tiktok_show_likes ?? true,
    showVideos: widget.tiktok_show_videos ?? true,
  });
  const [lastfm, setLastfm] = useState<LastfmOptions>({
    mode: widget.lastfm_mode ?? "now_playing",
    showArtist: widget.lastfm_show_artist ?? true,
    showAlbum: widget.lastfm_show_album ?? true,
    showScrobbles: widget.lastfm_show_scrobbles ?? true,
    showArtists: widget.lastfm_show_artists ?? true,
  });
  const [weather, setWeather] = useState<WeatherOptions>({
    showFeelsLike: widget.weather_show_feels_like ?? false,
    temperatureUnit: widget.weather_temperature_unit ?? "celsius",
    showLocation: widget.weather_show_location ?? true,
    showCondition: widget.weather_show_condition ?? true,
  });

  useEffect(() => {
    if (!open) return;
    setIdentifier(widget.identifier);
    setShowButton(widget.show_button);
    setDiscord({
      showBadges: widget.discord_show_badges ?? true,
      showGuildTag: widget.discord_show_guild_tag ?? true,
      showAvatarDecoration: widget.discord_show_avatar_decoration ?? true,
      showActivity: widget.discord_show_activity ?? true,
      showStatus: widget.discord_show_status ?? true,
    });
    setTiktok({
      showVerified: widget.tiktok_show_verified ?? true,
      showFollowers: widget.tiktok_show_followers ?? true,
      showFollowing: widget.tiktok_show_following ?? true,
      showLikes: widget.tiktok_show_likes ?? true,
      showVideos: widget.tiktok_show_videos ?? true,
    });
    setLastfm({
      mode: widget.lastfm_mode ?? "now_playing",
      showArtist: widget.lastfm_show_artist ?? true,
      showAlbum: widget.lastfm_show_album ?? true,
      showScrobbles: widget.lastfm_show_scrobbles ?? true,
      showArtists: widget.lastfm_show_artists ?? true,
    });
    setWeather({
      showFeelsLike: widget.weather_show_feels_like ?? false,
      temperatureUnit: widget.weather_temperature_unit ?? "celsius",
      showLocation: widget.weather_show_location ?? true,
      showCondition: widget.weather_show_condition ?? true,
    });
  }, [open, widget]);

  function patchDiscord(key: keyof DiscordOptions, value: boolean) {
    setDiscord((prev) => ({ ...prev, [key]: value }));
  }
  function patchTiktok(key: keyof TiktokOptions, value: boolean) {
    setTiktok((prev) => ({ ...prev, [key]: value }));
  }
  function patchLastfm(key: keyof LastfmOptions, value: boolean) {
    setLastfm((prev) => ({ ...prev, [key]: value }));
  }
  function patchWeather(
    key: Exclude<keyof WeatherOptions, "temperatureUnit">,
    value: boolean,
  ) {
    setWeather((prev) => ({ ...prev, [key]: value }));
  }

  const toggles: ToggleConfig[] =
    widget.platform === "discord"
      ? [
          {
            key: "showBadges",
            label: "Show Badges",
            description: "Display your Discord profile badges.",
            checked: discord.showBadges,
            disabled: true,
            onCheckedChange: (v) => patchDiscord("showBadges", v),
          },
          {
            key: "showGuildTag",
            label: "Show Guild Tag",
            description: "Show your server tag next to your username.",
            checked: discord.showGuildTag,
            onCheckedChange: (v) => patchDiscord("showGuildTag", v),
          },
          {
            key: "showAvatarDecoration",
            label: "Show Avatar Decoration",
            description: "Show your avatar decoration",
            checked: discord.showAvatarDecoration,
            onCheckedChange: (v) => patchDiscord("showAvatarDecoration", v),
          },
          {
            key: "showActivity",
            label: "Show Activity",
            description: "Display current profile activity",
            checked: discord.showActivity,
            onCheckedChange: (v) => patchDiscord("showActivity", v),
          },
          {
            key: "showStatus",
            label: "Show Status",
            description: "Display your custom status text. (and emoji)",
            checked: discord.showStatus,
            onCheckedChange: (v) => patchDiscord("showStatus", v),
          },
        ]
      : widget.platform === "tiktok"
        ? [
            {
              key: "showVerified",
              label: "Show Verified Badge",
              description: "Display the verified checkmark, if you have one.",
              checked: tiktok.showVerified,
              onCheckedChange: (v) => patchTiktok("showVerified", v),
            },
            {
              key: "showFollowers",
              label: "Show Followers",
              description: "Display your follower count.",
              checked: tiktok.showFollowers,
              onCheckedChange: (v) => patchTiktok("showFollowers", v),
            },
            {
              key: "showFollowing",
              label: "Show Following",
              description: "Display your following count.",
              checked: tiktok.showFollowing,
              onCheckedChange: (v) => patchTiktok("showFollowing", v),
            },
            {
              key: "showLikes",
              label: "Show Likes",
              description: "Display your total likes (hearts) count.",
              checked: tiktok.showLikes,
              onCheckedChange: (v) => patchTiktok("showLikes", v),
            },
            {
              key: "showVideos",
              label: "Show Videos",
              description: "Display your total video count.",
              checked: tiktok.showVideos,
              onCheckedChange: (v) => patchTiktok("showVideos", v),
            },
          ]
        : widget.platform === "weather"
          ? [
              {
                key: "showLocation",
                label: "Show Location",
                description: "Display the city and region name.",
                checked: weather.showLocation,
                onCheckedChange: (v) => patchWeather("showLocation", v),
              },
              {
                key: "showCondition",
                label: "Show Condition",
                description: "Display the current weather condition text.",
                checked: weather.showCondition,
                onCheckedChange: (v) => patchWeather("showCondition", v),
              },
              {
                key: "showFeelsLike",
                label: "Show Feels Like",
                description: "Display the 'feels like' temperature.",
                checked: weather.showFeelsLike,
                onCheckedChange: (v) => patchWeather("showFeelsLike", v),
              },
            ]
          : lastfm.mode === "now_playing"
            ? [
                {
                  key: "showArtist",
                  label: "Show Artist",
                  description: "Display the artist name.",
                  checked: lastfm.showArtist,
                  onCheckedChange: (v) => patchLastfm("showArtist", v),
                },
                {
                  key: "showAlbum",
                  label: "Show Album",
                  description: "Display the album name.",
                  checked: lastfm.showAlbum,
                  onCheckedChange: (v) => patchLastfm("showAlbum", v),
                },
              ]
            : [
                {
                  key: "showScrobbles",
                  label: "Show Scrobbles",
                  description: "Display your total scrobble count.",
                  checked: lastfm.showScrobbles,
                  onCheckedChange: (v) => patchLastfm("showScrobbles", v),
                },
                {
                  key: "showArtists",
                  label: "Show Top Artists",
                  description: "Display your top artists.",
                  checked: lastfm.showArtists,
                  onCheckedChange: (v) => patchLastfm("showArtists", v),
                },
              ];

  async function handleSave() {
    setSaving(true);
    try {
      const platformData =
        widget.platform === "discord"
          ? {
              discord_show_badges: discord.showBadges,
              discord_show_guild_tag: discord.showGuildTag,
              discord_show_avatar_decoration: discord.showAvatarDecoration,
              discord_show_activity: discord.showActivity,
              discord_show_status: discord.showStatus,
            }
          : widget.platform === "tiktok"
            ? {
                tiktok_show_verified: tiktok.showVerified,
                tiktok_show_followers: tiktok.showFollowers,
                tiktok_show_following: tiktok.showFollowing,
                tiktok_show_likes: tiktok.showLikes,
                tiktok_show_videos: tiktok.showVideos,
              }
            : widget.platform === "weather"
              ? {
                  weather_show_location: weather.showLocation,
                  weather_show_condition: weather.showCondition,
                  weather_show_feels_like: weather.showFeelsLike,
                  weather_temperature_unit: weather.temperatureUnit,
                }
              : {
                  lastfm_mode: lastfm.mode,
                  lastfm_show_artist: lastfm.showArtist,
                  lastfm_show_album: lastfm.showAlbum,
                  lastfm_show_scrobbles: lastfm.showScrobbles,
                  lastfm_show_artists: lastfm.showArtists,
                };

      const res = await fetch(`/api/widgets/${widget.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          identifier,
          show_button: showButton,
          ...platformData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Widget updated");
      onOpenChange(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl sm:max-w-2xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Widget</DialogTitle>
          <DialogDescription>
            Update the identifier and settings for this {widget.platform}{" "}
            widget.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-xs">
              {widget.platform === "discord"
                ? "Discord ID"
                : widget.platform === "tiktok"
                  ? "TikTok Username"
                  : widget.platform === "weather"
                    ? "Location"
                    : "Last.fm Username"}
            </Label>
            <Input
              className="w-full h-10 rounded-3xl"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {widget.platform === "lastfm" && (
            <div className="flex flex-col gap-1.5 sm:w-36">
              <Label className="text-muted-foreground text-xs">Mode</Label>
              <Select
                value={lastfm.mode}
                onValueChange={(v) =>
                  setLastfm((prev) => ({ ...prev, mode: v as LastfmMode }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="now_playing">Now Playing</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {widget.platform === "weather" && (
            <div className="flex flex-col gap-1.5 sm:w-36">
              <Label className="text-muted-foreground text-xs">
                Temperature Unit
              </Label>
              <Select
                value={weather.temperatureUnit}
                onValueChange={(v) =>
                  setWeather((prev) => ({
                    ...prev,
                    temperatureUnit: v as TemperatureUnit,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    <SelectItem value="celsius">Celsius</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground text-xs">Settings</Label>
            <div className="flex flex-wrap gap-x-6 gap-y-4 pt-2">
              {toggles.map(({ key, ...toggle }) => (
                <ToggleRow key={key} {...toggle} />
              ))}
              {widget.platform !== "weather" && (
                <ToggleRow
                  label="Show Button"
                  description="Show a button that redirects to your profile"
                  checked={showButton}
                  onCheckedChange={setShowButton}
                />
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="bg-transparent border-transparent">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WidgetsForm({ widgets }: { widgets: Widget[] }) {
  const router = useRouter();
  const { update } = useSaveBar();

  const [widgetList, setWidgetList] = useState<Widget[]>(widgets);

  useEffect(() => {
    setWidgetList(widgets);
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = widgetList.findIndex((w) => w.id === active.id);
    const newIndex = widgetList.findIndex((w) => w.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(widgetList, oldIndex, newIndex).map((w, i) => ({
      ...w,
      position: i,
    }));

    setWidgetList(reordered);
    update({ widgets: reordered });
  }

  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [platform, setPlatform] = useState<Platform>("discord");
  const [identifier, setIdentifier] = useState(DEFAULT_IDENTIFIERS.discord);
  const [debouncedIdentifier, setDebouncedIdentifier] = useState(
    DEFAULT_IDENTIFIERS.discord,
  );
  const [showButton, setShowButton] = useState(true);

  const [discord, setDiscord] = useState<DiscordOptions>(DEFAULT_DISCORD);
  const [tiktok, setTiktok] = useState<TiktokOptions>(DEFAULT_TIKTOK);
  const [lastfm, setLastfm] = useState<LastfmOptions>(DEFAULT_LASTFM);
  const [weather, setWeather] = useState<WeatherOptions>(DEFAULT_WEATHER);

  function patchDiscord(key: keyof DiscordOptions, value: boolean) {
    setDiscord((prev) => ({ ...prev, [key]: value }));
  }

  function patchTiktok(key: keyof TiktokOptions, value: boolean) {
    setTiktok((prev) => ({ ...prev, [key]: value }));
  }

  function patchLastfm(key: keyof LastfmOptions, value: boolean) {
    setLastfm((prev) => ({ ...prev, [key]: value }));
  }

  function patchWeather(
    key: Exclude<keyof WeatherOptions, "temperatureUnit">,
    value: boolean,
  ) {
    setWeather((prev) => ({ ...prev, [key]: value }));
  }

  function handlePlatformChange(value: Platform) {
    setPlatform(value);
    setIdentifier(DEFAULT_IDENTIFIERS[value]);
    setDebouncedIdentifier(DEFAULT_IDENTIFIERS[value]);
  }

  function resetForm() {
    setPlatform("discord");
    setIdentifier(DEFAULT_IDENTIFIERS.discord);
    setDebouncedIdentifier(DEFAULT_IDENTIFIERS.discord);
    setShowButton(true);
    setDiscord(DEFAULT_DISCORD);
    setTiktok(DEFAULT_TIKTOK);
    setLastfm(DEFAULT_LASTFM);
    setWeather(DEFAULT_WEATHER);
  }

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedIdentifier(identifier), 500);
    return () => clearTimeout(timeout);
  }, [identifier]);

  const togglesByPlatform: Record<Platform, ToggleConfig[]> = {
    discord: [
      {
        key: "showBadges",
        label: "Show Badges",
        description: "Display your Discord profile badges.",
        checked: discord.showBadges,
        disabled: true,
        onCheckedChange: (v) => patchDiscord("showBadges", v),
      },
      {
        key: "showGuildTag",
        label: "Show Guild Tag",
        description: "Show your server tag next to your username.",
        checked: discord.showGuildTag,
        onCheckedChange: (v) => patchDiscord("showGuildTag", v),
      },
      {
        key: "showAvatarDecoration",
        label: "Show Avatar Decoration",
        description: "Show your avatar decoration",
        checked: discord.showAvatarDecoration,
        onCheckedChange: (v) => patchDiscord("showAvatarDecoration", v),
      },
      {
        key: "showActivity",
        label: "Show Activity",
        description: "Display current profile activity",
        checked: discord.showActivity,
        onCheckedChange: (v) => patchDiscord("showActivity", v),
      },
      {
        key: "showStatus",
        label: "Show Status",
        description: "Display your custom status text. (and emoji)",
        checked: discord.showStatus,
        onCheckedChange: (v) => patchDiscord("showStatus", v),
      },
    ],
    lastfm:
      lastfm.mode === "now_playing"
        ? [
            {
              key: "showArtist",
              label: "Show Artist",
              description: "Display the artist name.",
              checked: lastfm.showArtist,
              onCheckedChange: (v) => patchLastfm("showArtist", v),
            },
            {
              key: "showAlbum",
              label: "Show Album",
              description: "Display the album name.",
              checked: lastfm.showAlbum,
              onCheckedChange: (v) => patchLastfm("showAlbum", v),
            },
          ]
        : [
            {
              key: "showScrobbles",
              label: "Show Scrobbles",
              description: "Display your total scrobble count.",
              checked: lastfm.showScrobbles,
              onCheckedChange: (v) => patchLastfm("showScrobbles", v),
            },
            {
              key: "showArtists",
              label: "Show Top Artists",
              description: "Display your top artists.",
              checked: lastfm.showArtists,
              onCheckedChange: (v) => patchLastfm("showArtists", v),
            },
          ],
    tiktok: [
      {
        key: "showVerified",
        label: "Show Verified Badge",
        description: "Display the verified checkmark, if you have one.",
        checked: tiktok.showVerified,
        onCheckedChange: (v) => patchTiktok("showVerified", v),
      },
      {
        key: "showFollowers",
        label: "Show Followers",
        description: "Display your follower count.",
        checked: tiktok.showFollowers,
        onCheckedChange: (v) => patchTiktok("showFollowers", v),
      },
      {
        key: "showFollowing",
        label: "Show Following",
        description: "Display your following count.",
        checked: tiktok.showFollowing,
        onCheckedChange: (v) => patchTiktok("showFollowing", v),
      },
      {
        key: "showLikes",
        label: "Show Likes",
        description: "Display your total likes (hearts) count.",
        checked: tiktok.showLikes,
        onCheckedChange: (v) => patchTiktok("showLikes", v),
      },
      {
        key: "showVideos",
        label: "Show Videos",
        description: "Display your total video count.",
        checked: tiktok.showVideos,
        onCheckedChange: (v) => patchTiktok("showVideos", v),
      },
    ],
    weather: [
      {
        key: "showLocation",
        label: "Show Location",
        description: "Display the city and region name.",
        checked: weather.showLocation,
        onCheckedChange: (v) => patchWeather("showLocation", v),
      },
      {
        key: "showCondition",
        label: "Show Condition",
        description: "Display the current weather condition text.",
        checked: weather.showCondition,
        onCheckedChange: (v) => patchWeather("showCondition", v),
      },
      {
        key: "showFeelsLike",
        label: "Show Feels Like",
        description: "Display the 'feels like' temperature.",
        checked: weather.showFeelsLike,
        onCheckedChange: (v) => patchWeather("showFeelsLike", v),
      },
    ],
  };

  const toggles = togglesByPlatform[platform];

  function renderPreview() {
    if (platform === "discord") {
      return (
        <DiscordWidget
          discordId={debouncedIdentifier || undefined}
          options={{
            showBadges: discord.showBadges,
            showGuildTag: discord.showGuildTag,
            showAvatarDecoration: discord.showAvatarDecoration,
            showActivity: discord.showActivity,
            showStatus: discord.showStatus,
          }}
        />
      );
    }
    if (platform === "tiktok") {
      return (
        <TikTokWidget
          widget={{
            identifier: debouncedIdentifier || "",
            tiktok_show_followers: tiktok.showFollowers,
            tiktok_show_following: tiktok.showFollowing,
            tiktok_show_likes: tiktok.showLikes,
            tiktok_show_videos: tiktok.showVideos,
            tiktok_show_verified: tiktok.showVerified,
            show_button: showButton,
          }}
        />
      );
    }
    if (platform === "weather") {
      return (
        <WeatherWidget
          location={debouncedIdentifier || undefined}
          options={{
            show_location: weather.showLocation,
            show_condition: weather.showCondition,
            show_feels_like: weather.showFeelsLike,
            temperature_unit: weather.temperatureUnit,
          }}
        />
      );
    }
    return (
      <LastfmWidget
        username={debouncedIdentifier || undefined}
        mode={lastfm.mode}
        options={{
          show_album: lastfm.showAlbum,
          show_artist: lastfm.showArtist,
          show_scrobbles: lastfm.showScrobbles,
          show_artists: lastfm.showArtists,
          show_button: showButton,
        }}
      />
    );
  }

  function renderWidget(widget: Widget) {
    if (widget.platform === "discord") {
      return (
        <DiscordWidget
          discordId={widget.identifier}
          options={{
            showBadges: widget.discord_show_badges,
            showGuildTag: widget.discord_show_guild_tag,
            showAvatarDecoration: widget.discord_show_avatar_decoration,
            showActivity: widget.discord_show_activity,
            showStatus: widget.discord_show_status,
          }}
        />
      );
    }
    if (widget.platform === "tiktok") {
      return (
        <TikTokWidget
          widget={{
            identifier: widget.identifier,
            tiktok_show_followers: widget.tiktok_show_followers,
            tiktok_show_following: widget.tiktok_show_following,
            tiktok_show_likes: widget.tiktok_show_likes,
            tiktok_show_videos: widget.tiktok_show_videos,
            tiktok_show_verified: widget.tiktok_show_verified,
            show_button: widget.show_button,
          }}
        />
      );
    }
    if (widget.platform === "weather") {
      return (
        <WeatherWidget
          location={widget.identifier}
          options={{
            show_location: widget.weather_show_location ?? true,
            show_condition: widget.weather_show_condition ?? true,
            show_feels_like: widget.weather_show_feels_like ?? false,
            temperature_unit: widget.weather_temperature_unit ?? "celsius",
          }}
        />
      );
    }
    if (widget.platform === "lastfm") {
      return (
        <LastfmWidget
          username={widget.identifier}
          mode={widget.lastfm_mode}
          options={{
            show_album: widget.lastfm_show_album,
            show_artist: widget.lastfm_show_artist,
            show_scrobbles: widget.lastfm_show_scrobbles,
            show_artists: widget.lastfm_show_artists,
            show_button: widget.show_button,
          }}
        />
      );
    }
    return null;
  }

  function buildPayload() {
    const base = {
      platform,
      type: platform,
      identifier,
      show_button: showButton,
    };

    const platformData = {
      discord: {
        discord_show_badges: discord.showBadges,
        discord_show_guild_tag: discord.showGuildTag,
        discord_show_avatar_decoration: discord.showAvatarDecoration,
        discord_show_activity: discord.showActivity,
        discord_show_status: discord.showStatus,
      },
      tiktok: {
        tiktok_show_verified: tiktok.showVerified,
        tiktok_show_followers: tiktok.showFollowers,
        tiktok_show_following: tiktok.showFollowing,
        tiktok_show_likes: tiktok.showLikes,
        tiktok_show_videos: tiktok.showVideos,
      },
      lastfm: {
        lastfm_mode: lastfm.mode,
        lastfm_show_artist: lastfm.showArtist,
        lastfm_show_album: lastfm.showAlbum,
        lastfm_show_scrobbles: lastfm.showScrobbles,
        lastfm_show_artists: lastfm.showArtists,
      },
      weather: {
        weather_show_location: weather.showLocation,
        weather_show_condition: weather.showCondition,
        weather_show_feels_like: weather.showFeelsLike,
        weather_temperature_unit: weather.temperatureUnit,
      },
    };

    return { ...base, ...platformData[platform] };
  }

  async function handleAddWidget() {
    if (widgetList.length >= MAX_WIDGETS || adding) return;

    setAdding(true);
    try {
      const res = await fetch("/api/widgets", {
        method: "POST",
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error);
        return;
      }

      toast.success("Widget added");
      setOpen(false);
      resetForm();
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteWidget(id: string) {
    const res = await fetch(`/api/widgets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error);
      return;
    }
    setWidgetList((prev) => prev.filter((w) => w.id !== id));
    toast.success("Widget deleted");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-end gap-1.5">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center w-fit gap-1 px-4 text-sm"
              size={"lg"}
              disabled={widgetList.length >= MAX_WIDGETS}
            >
              <IconEdit /> Add Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-3xl sm:max-w-2xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Widget</DialogTitle>
              <DialogDescription>
                Pick a platform and set its type and identifier to add it to
                your profile.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-5">
              <div className="flex min-h-20 items-center justify-center rounded-xl bg-black/40 px-6 py-5">
                {renderPreview()}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-col gap-1.5 sm:w-44">
                  <Label className="text-muted-foreground text-xs">
                    Platform
                  </Label>
                  <Select
                    value={platform}
                    onValueChange={(v) => handlePlatformChange(v as Platform)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        {PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.icon}
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {platform === "lastfm" && (
                  <div className="flex flex-col gap-1.5 sm:w-36">
                    <Label className="text-muted-foreground text-xs">
                      Mode
                    </Label>
                    <Select
                      value={lastfm.mode}
                      onValueChange={(v) =>
                        setLastfm((prev) => ({
                          ...prev,
                          mode: v as LastfmMode,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          <SelectItem value="now_playing">
                            Now Playing
                          </SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {platform === "weather" && (
                  <div className="flex flex-col gap-1.5 sm:w-36">
                    <Label className="text-muted-foreground text-xs">
                      Temperature Unit
                    </Label>
                    <Select
                      value={weather.temperatureUnit}
                      onValueChange={(v) =>
                        setWeather((prev) => ({
                          ...prev,
                          temperatureUnit: v as TemperatureUnit,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectGroup>
                          <SelectItem value="celsius">Celsius</SelectItem>
                          <SelectItem value="fahrenheit">Fahrenheit</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="text-muted-foreground text-xs">
                    {platform === "discord"
                      ? "Discord ID"
                      : platform === "tiktok"
                        ? "TikTok Username"
                        : platform === "weather"
                          ? "Location"
                          : "Last.fm Username"}
                  </Label>
                  <Input
                    className="w-full h-10 rounded-3xl"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      platform === "discord"
                        ? "1358306603547496619"
                        : platform === "tiktok"
                          ? "@username"
                          : platform === "weather"
                            ? "Atlanta, GA"
                            : "paw2k"
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-muted-foreground text-xs">
                  Settings
                </Label>
                <div className="flex flex-wrap gap-x-6 gap-y-4 pt-2">
                  {toggles.map(({ key, ...toggle }) => (
                    <ToggleRow key={key} {...toggle} />
                  ))}
                  {platform !== "weather" && (
                    <ToggleRow
                      label="Show Button"
                      description="Show a button that redirects to your profile"
                      checked={showButton}
                      onCheckedChange={setShowButton}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="bg-transparent border-transparent">
              <Button onClick={handleAddWidget} disabled={adding}>
                {adding ? <FaSpinner className="animate-spin" /> : <IconPlus />}
                {adding ? "Adding..." : "Add Widget"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="h-auto w-full flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-foreground/10 bg-input/20 px-6 py-4">
        {widgetList.length === 0 ? (
          <div className="h-72 flex items-center justify-center flex-col gap-2">
            <IconLayoutGridFilled className="h-14 w-14 text-foreground" />
            <Label className="text-base">No widgets here yet</Label>
            <Label className="text-muted-foreground text-sm">
              No widgets added yet. Click &quot;Add Widget&quot; to get started.
            </Label>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgetList.map((w) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2 w-full">
                {widgetList.map((widget) => (
                  <SortableWidgetRow
                    key={widget.id}
                    widget={widget}
                    renderWidget={renderWidget}
                    onEdit={setEditingWidget}
                    onDelete={handleDeleteWidget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      {editingWidget && (
        <EditWidgetDialog
          widget={editingWidget}
          open={!!editingWidget}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditingWidget(null);
          }}
          onSaved={() => router.refresh()}
        />
      )}
    </div>
  );
}
