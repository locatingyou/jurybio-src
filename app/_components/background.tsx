"use client";
import LineWaves from '@/components/LineWaves';

export default function Background({
  fullscreen
}: {
  fullscreen?: boolean
}) {
  return (
    <div className="-z-10 w-full h-full absolute inset-0 pointer-events-none opacity-25 blur-md">
      <LineWaves
        speed={0.3}
        innerLineCount={32}
        outerLineCount={36}
        warpIntensity={1}
        rotation={-45}
        edgeFadeWidth={0}
        colorCycleSpeed={1}
        brightness={0.2}
        color1="#ffffff"
        color2="#ffffff"
        color3="#ffffff"
        enableMouseInteraction
        mouseInfluence={2}
      />
      {fullscreen && (
        <div
          className="absolute inset-x-0 bottom-0 h-150 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--background))",
          }}
        />
      )}
    </div>
  );
}