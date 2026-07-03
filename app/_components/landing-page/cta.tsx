"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Marquee } from "@/components/ui/marquee";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export default function CTA() {
  // remove this after
  const user_count = 100000000000000000;
  // so if theres like 10000 users format to 1,0000 10k 10,000 so on u get it :3
  function FormatUsers(count: number) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  interface User {
    username: string;
    url: string;
    avatar: string;
  }
  const users: User[] = Array.from({ length: 12 }, () => ({
    username: "onlyaaryn", url: "/onlyaaryn", avatar: "/avatar.webp"
  }));
  return (
    <main className="w-full py-4 mx-auto bg-gradient-to-t from-white/[0.01] via-background to-background flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <Card className="w-full">
          <CardContent className="flex items-center flex-col gap-2 py-4">
            <h1 className="text-lg font-bold">Ready to Create your Profile?</h1>
            <p className="text-base text-muted-foreground">Get Started and Join <span className="font-bold text-white">{FormatUsers(user_count)}</span> other users</p>
            <div className="relative w-full overflow-hidden">
              <Marquee pauseOnHover className="[--duration:80s]">
                {users.map((user, i) => (
                  <Link
                    key={`${user.username}-${i}`}
                    href={user.url}
                    className="hover:bg-zinc-900/60 rounded-lg transition-all px-2 py-1.5 flex items-center gap-2 flex-shrink-0 mx-1"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      <Image src={user.avatar} alt={user.username} fill className="object-cover relative" />
                    </div>
                    <p className="text-white/80 text-sm font-semibold truncate max-w-[100px]">{user.username}</p>
                  </Link>
                ))}
              </Marquee>
              <div className="from-card pointer-events-none absolute inset-y-0 left-0 w-48 bg-gradient-to-r" />
              <div className="from-card pointer-events-none absolute inset-y-0 right-0 w-48 bg-gradient-to-l" />
            </div>
            <div className="flex items-center gap-2 py-4 w-full max-w-sm">
              <InputGroup className="flex-1 py-4.5 px-1">
                <InputGroupInput
                  pattern="^\S+$"
                  className="ml-0 !pl-0 text-white placeholder:text-white"
                  placeholder="username"
                  // block spaces :3
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData("text").replace(/\s/g, "");
                    document.execCommand("insertText", false, pasted);
                  }}
                />
                <InputGroupAddon>
                  <span>
                    jury.lat/
                  </span>
                </InputGroupAddon>
              </InputGroup>
              <Button className="shrink-0 gap-1.5 rounded-2xl text-sm font-semibold text-center py-4.5 px-4">
                Get Started <IconArrowRight size={15} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}