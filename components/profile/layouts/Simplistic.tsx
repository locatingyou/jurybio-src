import { Config } from "@/lib/types/profile";
import Card from "../card";
import Username from "../components/username";
import Banner from "../components/banner";
import Avatar from "../components/avatar";
import Description from "../components/description";
import { FaLocationDot } from "react-icons/fa6";
import Widgets from "../widgets";
import Links from "../links";
import Badges from "../badges";
import InlineAudioPlayer from "../audioplayers/inline";

export default function Simplistic({
  config,
  user,
}: {
  config: Config;
  user: {
    username: string;
    uid: number;
  };
}) {
  return (
    <Card config={config} className="relative flex flex-col overflow-hidden">
      <div className="absolute inset-x-0 top-0">
        <Banner className="" config={{ ...config, banner_opacity: 1 }} />
      </div>
      <div
        className={`flex flex-row w-full gap-4 z-10 ${config.banner_url ? "mt-20" : ""}`}
      >
        <div className="">
          <Avatar config={config} />
        </div>
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-2">
            <Username
              username={config.display_name || user.username}
              text_color={config.username_color}
              uid={user.uid}
              fontType="bold"
              username_effects={(config.username_effects as any) || []}
            />
            {config.badges?.length > 0 && (
              <Badges config={config} badges={config.badges} />
            )}
          </div>
          <Description config={config} />
        </div>
      </div>
      <div className="flex flex-row gap-4 mb-2 z-10">
        {config.location && (
          <h1 className="flex flex-row items-center text-center gap-2 text-sm font-normal">
            <FaLocationDot />
            {config.location}
          </h1>
        )}
      </div>

      <Widgets config={config} />
      <div className="w-full z-10 mb-4 mt-2">
        <Links config={config} align="center" />
      </div>
      {(config.audios?.length ?? 0) > 0 && (
        <div className="mb-2">
          {config.audio_player_layout === "Inline" && (
            <InlineAudioPlayer
              config={config}
              autoStart={config.entry_enabled}
            />
          )}
        </div>
      )}
    </Card>
  );
}
