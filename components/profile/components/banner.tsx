import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Banner({
  config,
  className,
}: {
  config: {
    banner_url: string | null;
    banner_opacity: number;
  };
  // this is only for height imo but fuk it do whateva
  className?: string;
}) {
  const { banner_url, banner_opacity } = config;

  if (!banner_url) return null;

  return (
    <div
      style={{
        WebkitMaskImage: `linear-gradient(to bottom, black ${banner_opacity}%, transparent 100%)`,
        maskImage: `linear-gradient(to bottom, black ${banner_opacity}%, transparent 100%)`,
      }}
      className={cn("absolute h-40 w-full", className)}
    >
      <Image
        src={banner_url}
        alt="banner"
        fill
        className="relative h-full w-full object-cover"
      />
    </div>
  );
}
