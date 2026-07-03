import { Config } from "@/lib/types/profile";
import { SecondaryCard } from "../card";
import { CSSProperties } from "react";
import DiscordWidget from "./discord";
import LastFMWidget from "./lastfm";
import TikTokWidget from "./tiktok";
import WeatherWidget from "./weather";

export default function Widgets({ config }: { config: Config }) {
  if (!config.widgets || config.widgets.length === 0) {
    return null;
  }

  const enabledWidgets = config.widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.position - b.position);

  if (enabledWidgets.length === 0) return null;

  const count = enabledWidgets.length;

  return (
    <div
      className={`grid gap-4 py-2 items-stretch ${
        count <= 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
      }`}
    >
      {enabledWidgets.map((widget, idx) => {
        const isLastVisible = idx === count - 1 && count % 2 !== 0;

        let widgetContent = null;
        if (widget.platform === "discord") {
          widgetContent = (
            <DiscordWidget
              discordId={widget.identifier}
              options={{
                showBadges: widget.discord_show_badges,
                showGuildTag: widget.discord_show_guild_tag,
                showAvatarDecoration: widget.discord_show_avatar_decoration,
                showActivity: widget.discord_show_activity,
                showStatus: widget.discord_show_status,
              }}
              textColor={config.text_color}
              secondaryTextColor={config.secondary_text_color}
            />
          );
        } else if (widget.platform === "tiktok") {
          widgetContent = <TikTokWidget widget={widget} />;
        } else if (widget.platform === "weather") {
          widgetContent = (
            <WeatherWidget
              location={widget.identifier}
              options={{
                show_condition: widget.weather_show_condition,
                show_feels_like: widget.weather_show_feels_like,
                show_location: widget.weather_show_location,
                temperature_unit: widget.weather_temperature_unit,
              }}
              textColor={config.text_color}
              secondaryTextColor={config.secondary_text_color}
            />
          );
        } else if (widget.platform === "lastfm") {
          widgetContent = (
            <LastFMWidget
              username={widget.identifier}
              mode={widget.lastfm_mode}
              options={{
                show_artist: widget.lastfm_show_artist,
                show_album: widget.lastfm_show_album,
                show_scrobbles: widget.lastfm_show_scrobbles,
                show_artists: widget.lastfm_show_artists,
                show_button: widget.show_button,
              }}
              textColor={config.text_color}
              secondaryTextColor={config.secondary_text_color}
            />
          );
        } else {
          return null; // unsupported widgets for now
        }

        return (
          <div
            key={widget.id}
            className="w-full min-h-0"
            style={{
              gridColumn: isLastVisible ? "1 / -1" : undefined,
            }}
          >
            <SecondaryCard
              config={config}
              className="relative h-18 px-4 py-3 flex flex-row items-center min-w-0"
            >
              {widgetContent}
            </SecondaryCard>
          </div>
        );
      })}
    </div>
  );
}
