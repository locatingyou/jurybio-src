// app/not-found.tsx
import { Button } from "@/components/ui/button";
import { IconCopy, IconHelp, IconLink } from "@tabler/icons-react";
import { FaDiscord } from "react-icons/fa6";
import Link from "next/link";
import Background from "@/app/_components/background";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";

export default async function NotFound({ url = "" }: { url?: string } = {}) {
  const session = await getSession();
  let loggedInUser: string | null = null;

  if (session) {
    const [user] = await db
      .select({ username: usersTable.username })
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);
    loggedInUser = user?.username ?? null;
  }

  const claimHref = loggedInUser
    ? `/dashboard`
    : `/auth?mode=register&url=${url}`;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 px-4 overflow-hidden">
      <Background />
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-3">
        <div className="w-full rounded-2xl border border-white/[0.07] bg-black/60 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
          <div className="relative px-6 pt-6 pb-5 flex flex-col gap-4">
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-end pr-4 overflow-hidden">
              <span className="text-[88px] font-black text-white/[0.03] tracking-tighter leading-none select-none">
                @
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-[22px] font-bold tracking-tight text-white leading-tight">
                @{url}
              </h1>
              <p className="text-sm text-white/45 leading-relaxed">
                This handle hasn&apos;t been claimed yet. Make it yours before
                someone else does.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button className="w-4/5" size={"lg"} asChild>
                <Link href={claimHref}>Claim @{url}</Link>
              </Button>
              <Button
                asChild
                variant="discord"
                className="rounded-full gap-2 shrink-0"
                size={"icon-lg"}
              >
                <Link
                  href="https://discord.gg/jurybio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaDiscord size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {loggedInUser && (
          <div className="w-full rounded-2xl border border-white/[0.07] bg-black/40 backdrop-blur-2xl px-5 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)] flex flex-col gap-3">
            <div className="flex items-center gap-1 text-[13px] text-white/45">
              Signed in as{" "}
              <span className="font-semibold text-white/80">
                @{loggedInUser}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 rounded-xl"
              >
                <Link href={`/${loggedInUser}`}>
                  <IconLink size={13} /> Open
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 rounded-xl"
              >
                <Link href={`https://jury.lat/${loggedInUser}`}>
                  <IconCopy size={13} /> Copy link
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 rounded-xl"
              >
                <Link
                  href="https://discord.gg/jurybio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconHelp size={13} /> Help
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
