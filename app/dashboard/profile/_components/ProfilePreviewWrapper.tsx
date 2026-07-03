"use client";
import { ReactNode, useState } from "react";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import ProfilePageProvider from "@/components/profile/PageProvider";
import ProfileContent from "@/components/profile/ProfileContent";
import { Config, Profile } from "@/lib/types/profile";

export function ProfilePreviewWrapper({
  children,
  config,
  user,
  showPreview = true,
}: {
  children: ReactNode;
  showPreview?: boolean;
  config: Config;
  user: Profile;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleButton = (
    <button
      onClick={() => setIsFullscreen((prev) => !prev)}
      className="absolute right-4 top-4 z-10 border border-white/10 bg-black p-2 rounded-md flex justify-center items-center"
    >
      {isFullscreen ? (
        <IconArrowsMinimize className="w-4 h-4" />
      ) : (
        <IconArrowsMaximize className="w-4 h-4" />
      )}
    </button>
  );

  const previewContent = (
    <div className="relative flex h-full w-full items-center justify-center bg-black overflow-hidden">
      <div className="relative w-full h-full isolate overflow-hidden">
        <ProfilePageProvider
          config={{ ...config, background_mute: true, entry_enabled: false }}
          background={config.backgrounds?.[0] ?? null}
        >
          <ProfileContent
            user={user}
            config={{ ...config, widgets: [], entry_enabled: false }}
          />
        </ProfilePageProvider>
      </div>
      {toggleButton}
    </div>
  );

  return (
    <>
      {isFullscreen && showPreview && (
        <div className="fixed inset-0 z-50 bg-black flex">{previewContent}</div>
      )}
      <div className="flex flex-1 h-full overflow-hidden">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className={`mx-auto flex w-full flex-col gap-6 py-10 px-6 ${showPreview ? "max-w-4xl" : "max-w-none"}`}
          >
            {children}
          </div>
        </div>
        {showPreview && (
          <div className="hidden xl:flex h-full w-[410px] shrink-0 flex-col overflow-hidden border-l">
            {!isFullscreen && previewContent}
          </div>
        )}
      </div>
    </>
  );
}
