import { verifyEmailToken } from "@/lib/api/data/email-verification";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { IconHelp } from "@tabler/icons-react";
import { FaDiscord } from "react-icons/fa6";
import Background from "../_components/background";

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Invalid link</CardTitle>
            <CardDescription className="text-white/45">
              No verification token was provided. Check the link from your email
              and try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HelpRow />
          </CardContent>
        </Card>
      </Shell>
    );
  }

  const result = await verifyEmailToken({ token });

  if (!result.success) {
    return (
      <Shell>
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Verification failed</CardTitle>
            <CardDescription className="text-white/45">
              {result.error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HelpRow />
          </CardContent>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Email verified!</CardTitle>
          <CardDescription className="text-white/45">
            Your email has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" asChild>
            <Link href="/auth">Continue to login</Link>
          </Button>
        </CardContent>
      </Card>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 px-4 overflow-hidden">
      <Background />
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

function HelpRow() {
  return (
    <div className="flex items-center gap-2 pt-1">
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
          <IconHelp size={13} /> Get help
        </Link>
      </Button>
      <Button
        asChild
        variant="discord"
        className="rounded-full gap-2 shrink-0"
        size="icon-lg"
      >
        <Link
          href="https://discord.gg/jurybio"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join Discord"
        >
          <FaDiscord size={16} />
        </Link>
      </Button>
    </div>
  );
}
