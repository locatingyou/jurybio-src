import { Config } from "@/lib/types/profile";
import Avatar from "../components/avatar";
import Username from "../components/username";
import Description from "../components/description";
import Widgets from "../widgets";
import Links from "../links";
import { SecondaryCard } from "../card";
import Badges from "../badges";
import JuneAudioPlayer from "../audioplayers/june";

export default function Portfolio({
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
    <>
      <style>{`
        .portfolio-snap-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className="portfolio-snap-container snap-y snap-mandatory overflow-y-auto h-svh w-full"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="snap-start relative min-h-svh flex items-center justify-center z-0">
          <div className="flex flex-col gap-4 items-center min-h-0">
            <Avatar config={config} />
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
        </div>
        <div className="snap-start min-h-svh p-6 flex flex-col gap-6 justify-center items-center z-50">
          <div className="w-full max-w-4xl flex flex-col gap-6 items-center">
            <SecondaryCard
              config={config}
              className="h-auto w-full z-10 rounded-2xl py-4 px-6 !bg-black/80"
            >
              <Description config={config} />
            </SecondaryCard>
          </div>
          <div className="mt-4 w-full max-w-4xl">
            <Widgets config={config} />
          </div>
          <Links config={config} align="center" />
        </div>
        {(config.audios?.length ?? 0) > 0 && (
          <div className="snap-start min-h-svh p-6 flex flex-col gap-6 justify-center items-center z-50">
            <div className="w-full max-w-4xl flex flex-col gap-6 items-center">
              <JuneAudioPlayer
                config={config}
                autoStart={config.entry_enabled}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
