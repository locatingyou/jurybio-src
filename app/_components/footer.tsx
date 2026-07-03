import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 h-24 mx-auto flex flex-col items-center justify-center w-full max-w-8xl">
      <div className="mb-2 pb-2 border-b border-white/10 w-full max-w-xl flex flex-row justify-between items-center">
        <div>
        <Button variant={"link"} size={"default"} className="text-base font-semibold">
        <Link href="/">Jury</Link>
        </Button>
        </div>
        <div className="flex gap-4 text-sm">
        <Link className="text-white/60 hover:text-white transition-colors duration-500" href="/#pricing">Pricing</Link>
        <Link className="text-white/60 hover:text-white transition-colors duration-500" href="/#pricing">Terms</Link>
        <Link className="text-white/60 hover:text-white transition-colors duration-500" href="/#pricing">Privacy</Link>
        </div>
        <div>
          <Link
            href="https://discord.gg/jurybio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/90 hover:text-white transition-colors duration-500"
          >
            <FaDiscord className="h-5 w-5" />
          </Link>
        </div>
      </div>
      {/*>:3*/}
      <p className="text-[12px] text-white/70">Designed by <span className="font-semibold text-white">rose</span></p>
    </footer>
  );
}
