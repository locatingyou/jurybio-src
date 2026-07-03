import { Config } from "@/lib/types/profile";
import { CSSProperties } from "react";

export default function Overlay({ config }: { config: Partial<Config> }) {
  return (
    <>
      {config.page_overlays?.includes("Shooting Stars") && (
        <img
          src="/overlays/shooting-stars.gif"
          alt=""
          className="fixed inset-0 w-full h-full object-cover pointer-events-none opacity-5 z-[999999999]"
        />
      )}
    </>
  );
}
