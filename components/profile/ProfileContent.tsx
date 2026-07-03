"use client";
import { Config, Profile } from "@/lib/types/profile";
import Animation from "./animation";
import Stacked from "./layouts/Stacked";
import Compact from "./layouts/Compact";
import Simplistic from "./layouts/Simplistic";
import Portfolio from "./layouts/Portfolio";
import DefaultAudioPlayer from "./audioplayers/default";
import TextAudioPlayer from "./audioplayers/text";
import JuneAudioPlayer from "./audioplayers/june";
import { useProfileVisibility } from "./PageProvider";

export default function ProfileContent({
  config,
  user,
}: {
  config: Config;
  user: Profile;
}) {
  const { isProfileVisible } = useProfileVisibility();
  const layout = config.card_layout?.toLowerCase();
  const audioLayout = config.audio_player_layout ?? "Card";
  const isPortfolio = layout === "portfolio";

  let layoutContent;
  if (layout === "stacked") {
    layoutContent = <Stacked user={user} config={config} />;
  } else if (layout === "compact") {
    layoutContent = <Compact user={user} config={config} />;
  } else if (layout === "simplistic") {
    layoutContent = <Simplistic user={user} config={config} />;
  } else if (layout === "portfolio") {
    layoutContent = <Portfolio user={user} config={config} />;
  } else {
    layoutContent = <></>;
  }
  const audioPlayerContent =
    !isPortfolio &&
    (config.audios?.length ?? 0) > 0 &&
    (audioLayout === "Text" ? (
      <TextAudioPlayer config={config} autoStart={isProfileVisible} />
    ) : audioLayout === "June" ? (
      <JuneAudioPlayer config={config} autoStart={isProfileVisible} />
    ) : audioLayout !== "Inline" ? (
      <DefaultAudioPlayer config={config} autoStart={isProfileVisible} />
    ) : null);

  return (
    <Animation
      card_animation={
        isProfileVisible ? (config.card_animation ?? "None") : "None"
      }
    >
      <div
        className={
          isPortfolio
            ? "w-full h-svh relative"
            : "flex flex-col gap-6 justify-center items-center w-full min-h-screen p-4 relative"
        }
      >
        {layoutContent}
        {audioPlayerContent}
      </div>
    </Animation>
  );
}
