import { Config } from "@/lib/types/profile";
import Card from "../card";
import Username from "../components/username";
import Banner from "../components/banner";
import Avatar from "../components/avatar";
import Description from "../components/description";
import Widgets from "../widgets";
import Badges from "../badges";
import Links from "../links";
import InlineAudioPlayer from "../audioplayers/inline";

export default function Stacked({
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
    <Card
      config={config}
      className="relative flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0">
        <Banner config={{ ...config, banner_opacity: 0 }} />
      </div>
      <div className="items-center justify-center flex flex-col w-full gap-2 text-center z-10">
        <div className={config.banner_url ? "mt-20" : "mt-0"}>
          <Avatar config={config} />
        </div>
        <Username
          username={config.display_name || user.username}
          text_color={config.username_color}
          uid={user.uid}
          fontType="bold"
          username_effects={(config.username_effects as any) || []}
        />
        <Description config={config} />
        {config.badges?.length > 0 && (
          <Badges config={config} badges={config.badges} />
        )}
      </div>
      <div className="w-full mt-2 z-10">
        <Widgets config={config} />
      </div>
      <div className="w-full mt-4 mb-2 z-10">
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
