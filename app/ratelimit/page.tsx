import Link from "next/link";
import Background from "@/app/_components/background";

export default function RateLimited() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-white/[0.03] via-background to-background" />
      <Background />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <h1 className="text-8xl font-bold mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          429
        </h1>
        <h2 className="text-2xl font-semibold mb-3">Too many requests</h2>
        <p className="text-white/60 mb-8">
          You&apos;re making requests too quickly. Please wait a moment before
          trying again.
        </p>
      </div>
    </div>
  );
}
