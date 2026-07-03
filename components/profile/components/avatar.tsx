import Image from "next/image";

export default function Avatar({
  config,
}: {
  config: {
    avatar_url: string | null;
    avatar_shape: "SQUARE" | "ROUNDED" | "CIRCLE";
    avatar_decoration?: string | null;
  };
}) {
  if (!config.avatar_url) return null;
  return (
    <>
      <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
        <Image
          src={config.avatar_url}
          alt="avatar"
          fill
          className={`h-full w-full object-cover ${
            config.avatar_shape === "CIRCLE"
              ? "rounded-full"
              : config.avatar_shape === "ROUNDED"
                ? "rounded-xl"
                : "rounded-none"
          }`}
        />
        {config.avatar_decoration && (
          <Image
            src={`/decorations/${config.avatar_decoration}`}
            fill
            className="absolute inset-0 w-full h-full scale-[1.2] pointer-events-none z-30"
            alt="decoration"
          ></Image>
        )}
      </div>
    </>
  );
}
