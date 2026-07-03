import Link from "next/link";
import Background from "@/app/_components/background";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-white/[0.03] via-background to-background" />
      <Background />
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <h1 className="text-8xl font-bold mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
        <p className="text-white/60 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/[0.15] transition-all duration-300"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
