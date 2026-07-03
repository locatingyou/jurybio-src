"use client";
import Image from "next/image";
import {
  createContext,
  CSSProperties,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CursorTrail } from "./cursor-trails";
import { Config } from "@/lib/types/profile";
import Silk from "./backgrounds/Silk";
import Plasma from "./backgrounds/Plasma";
import FloatingLines from "./backgrounds/FloatingLines";
import LightPillar from "./backgrounds/LightPillar";

const ProfileVisibilityContext = createContext<{
  isProfileVisible: boolean;
  setIsProfileVisible: (visible: boolean) => void;
} | null>(null);

export const useProfileVisibility = () => {
  const context = useContext(ProfileVisibilityContext);
  if (!context) {
    throw new Error(
      "useProfileVisibility must be used within ProfilePageProvider.",
    );
  }
  return context;
};

function AnimatedBackground({
  effect,
  color,
}: {
  effect: Config["background_effect"] | undefined;
  color: string;
}) {
  switch (effect) {
    case "Silk":
      return <Silk color={color} />;
    case "Plasma":
      return <Plasma mouseInteractive={false} color={color} />;
    case "Floating_Lines":
      return (
        <FloatingLines
          interactive
          bendRadius={15}
          bendStrength={2}
          parallax
          linesGradient={color ? [color] : undefined}
        />
      );
    case "Pillar":
      return (
        <LightPillar
          intensity={1}
          rotationSpeed={1.4}
          glowAmount={0.001}
          pillarWidth={1.5}
          pillarHeight={0.6}
          noiseIntensity={0}
          pillarRotation={0}
          topColor={color}
          bottomColor={color}
        />
      );
    default:
      return null;
  }
}

export default function ProfilePageProvider({
  config,
  background,
  children,
}: {
  config: Config;
  background: {
    url: string | null;
    file_type: "video" | "image";
  } | null;
  children: ReactNode;
}) {
  const [isProfileVisible, setIsProfileVisible] = useState(
    !config.entry_enabled,
  );
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasAnimatedBackground = Boolean(config.background_effect);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.5;
    }
  }, []);
  useEffect(() => {
    if (videoRef.current) {
      if (isProfileVisible) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isProfileVisible]);

  return (
    <ProfileVisibilityContext.Provider
      value={{ isProfileVisible, setIsProfileVisible }}
    >
      <main
        style={
          {
            "--background": config.background_color,
            "--background-blur": `${config.background_blur}px`,
            "--foreground": config.text_color,
            "--font-family": config.font_family,
            fontFamily: config.font_family,
          } as CSSProperties
        }
        className="relative h-full w-full overflow-hidden"
      >
        {config.fonts && config.fonts.length > 0 && (
          <style>
            {config.fonts
              .map(
                (font) => `
              @font-face {
                font-family: '${font.title}';
                src: url('${font.font_url}');
              }
            `,
              )
              .join("\n")}
          </style>
        )}

        {config.cursor_effect && (
          <CursorTrail
            trail={(config.cursor_effect as any) ?? null}
            color={config.cursor_color ?? "#FFFFFF"}
          />
        )}

        {hasAnimatedBackground && (
          <div
            className="absolute inset-0 z-0 h-full w-full overflow-hidden"
            style={{
              filter: `blur(${config.background_blur}px)`,
            }}
          >
            <AnimatedBackground
              effect={config.background_effect}
              color={config.theme_color}
            />
          </div>
        )}

        {!hasAnimatedBackground &&
          background?.url &&
          background.file_type === "image" && (
            <Image
              src={background.url}
              fetchPriority="high"
              alt="background :3"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              style={{
                filter: `blur(${config.background_blur}px)`,
              }}
              fill
            />
          )}
        {!hasAnimatedBackground &&
          background?.url &&
          background.file_type === "video" && (
            <video
              ref={videoRef}
              autoPlay={isProfileVisible}
              src={background.url}
              style={{
                filter: `blur(${config.background_blur}px)`,
              }}
              playsInline
              draggable="false"
              muted={config.background_mute}
              loop
              disablePictureInPicture
              controlsList="nofullscreen"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
            />
          )}
        {children}
      </main>
    </ProfileVisibilityContext.Provider>
  );
}
