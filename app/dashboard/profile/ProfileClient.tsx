"use client";
import { ProfilePreviewWrapper } from "./_components/ProfilePreviewWrapper";
import ProfileForm from "./_forms/ProfileForm";
import { Separator } from "@/components/ui/separator";
import { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import LayoutForm from "./_forms/LayoutForm";
import CardSettings from "./_forms/CardSettings";
import AnimationSettings from "./_forms/Animation-Settings";
import PageEffects from "./_forms/PageEffects";
import AvailableBadges from "./_forms/AvailableBadges";
import { Account, Config, Profile } from "@/lib/types/profile";
import { SaveBar } from "./_components/Savebar";
import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { configAtom, originalAtom } from "@/lib/stores/save-bar";
import LinksForm from "./_forms/LinksForm";
import WidgetsForm from "./_forms/WidgetsForm";
import BadgeEditor from "./_forms/BadgeEditor";
import PageSettings from "./_forms/PageSettings";

function TabContent({
  children,
  visible,
}: {
  children: ReactNode;
  visible: boolean;
}) {
  if (!visible) return null;
  return <>{children}</>;
}

export default function ProfilePageClient({
  config,
  user,
}: {
  config: Config;
  user: {
    id: string;
    username: string;
    premium: boolean;
    url: string;
    uid: number;
    blacklisted: boolean;
    blacklisted_reason: string | null;
    blacklisted_by: string | null;
    blacklisted_at: Date | null;
  };
}) {
  useHydrateAtoms([
    [configAtom, config],
    [originalAtom, config],
  ]);
  const currentTab = (useSearchParams().get("tab") || "profile").toLowerCase();
  const current = useAtomValue(configAtom);
  return (
    <>
      <SaveBar />
      <ProfilePreviewWrapper
        config={{ ...current, cursor_effect: "" }}
        user={user}
        showPreview={currentTab !== "badges"}
      >
        <TabContent visible={currentTab === "profile"}>
          <div className="flex flex-col gap-4">
            <ProfileForm premium={user.premium} username={user.username} config={current} />
          </div>
        </TabContent>
        <TabContent visible={currentTab === "appearance"}>
          <PageSettings config={current} />
          <div className="flex flex-col gap-4">
            <LayoutForm
              config={{
                layout: config.card_layout,
                audio_player_layout: config.audio_player_layout,
              }}
            />
            <Separator />
            <CardSettings config={current} />
            <Separator />
            {/*<AnimationSettings
              username={user.username}
              config={{
                audio_player_animation: "Slide Up",
                card_animation: current.card_animation,
              }}
              premium={user.premium}
            />*/}
            <Separator />
            <PageEffects premium={user.premium} config={current} />
          </div>
        </TabContent>
        <TabContent visible={currentTab === "widgets"}>
          <WidgetsForm widgets={current.widgets} />
        </TabContent>
        <TabContent visible={currentTab === "links"}>
          <LinksForm links={current.links} />
        </TabContent>
        <TabContent visible={currentTab === "badges"}>
          <AvailableBadges badges={config.badges} />
          <BadgeEditor config={current} badges={current.badges} />
        </TabContent>
      </ProfilePreviewWrapper>
    </>
  );
}
