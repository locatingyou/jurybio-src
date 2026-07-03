"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";
import {
  FaDiscord,
  FaInstagram,
  FaSpotify,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { SiRoblox } from "react-icons/si";
import { motion } from "motion/react";
import { GiSoundWaves } from "react-icons/gi";

const integrations = [
  { icon: FaXTwitter, name: "Twitter", color: "#fff" },
  { icon: FaDiscord, name: "Discord", color: "#5865F2" },
  { icon: FaInstagram, name: "Instagram", color: "#D62976" },
  { icon: FaSpotify, name: "Spotify", color: "#1ED760" },
  { icon: FaYoutube, name: "YouTube", color: "#FF0000" },
  { icon: SiRoblox, name: "Roblox", color: "#FF0000" },
];

const firstRow = integrations.slice(0, integrations.length / 2);
const secondRow = integrations.slice(integrations.length / 2);

export default function Features() {
  return (
    <main className="bg-gradient-to-b from-white/[0.01] via-background to-background">
      <section className="pt-16 flex flex-col items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-2"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Why{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-gradient-to-b from-white/30 via-white/90 to-white/30 bg-clip-text">
                Choose
              </span>
              <svg
                className="absolute -bottom-1 left-0 w-full overflow-visible pointer-events-none"
                height="8"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M 0 5 C 15 3, 30 6, 45 4.5 S 70 6, 85 4 S 95 5.5, 100 4"
                  stroke="var(--chart-2)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
            </span>{" "}
            Us?
          </h1>
        </motion.div>

        <span className="w-full max-w-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent h-[1px]" />
      </section>
      <section className="pt-2 pb-16 flex mt-4 items-center flex-col gap-12 w-full max-w-2xl mx-auto px-4">
        <div className="flex flex-col items-start gap-2 w-full max-w-sm mr-auto">
          <h1 className="text-2xl font-semibold">Integrations</h1>
          <p className="text-base text-white/60">
            Integrate your favorite platforms
          </p>
          <div className="relative w-full overflow-hidden">
            <Marquee>
              {firstRow.map((integration, index) => (
                <Card
                  key={index}
                  className="flex items-center gap-3 justify-center flex-row px-4 py-2"
                >
                  <integration.icon
                    className="h-5 w-5"
                    style={{ color: integration.color }}
                  />
                  <span className="text-foreground">{integration.name}</span>
                </Card>
              ))}
            </Marquee>
            <Marquee reverse>
              {secondRow.map((integration, index) => (
                <Card
                  key={index}
                  className="flex items-center gap-3 justify-center flex-row px-4 py-2"
                >
                  <integration.icon
                    className="h-5 w-5"
                    style={{ color: integration.color }}
                  />
                  <span className="text-foreground">{integration.name}</span>
                </Card>
              ))}
            </Marquee>
            <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r" />
            <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l" />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 w-full ml-auto">
          <h1 className="text-2xl font-semibold">Widgets</h1>
          <p className="text-base text-right text-white/60">
            Display links to your favorite platforms on your profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Card className="min-w-0 overflow-hidden p-0 mt-2 flex-1">
              <CardContent className="p-0 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0">
                    <Image
                      src="/avatar.webp"
                      alt="logo"
                      fill
                      className="rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 shrink-0 z-20 border-2 border-background" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base font-semibold text-foreground truncate">
                      onlyaaryn
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GiSoundWaves className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-white/60 truncate">
                        Listening to Lucy Bedroque
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="min-w-0 overflow-hidden p-0 mt-2 flex-1">
              <CardContent className="p-0 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0">
                    <Image
                      src="/logo.webp"
                      alt="logo"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col min-w-0 gap- flex-1">
                    <span className="text-base font-semibold text-foreground truncate">
                      jury
                    </span>
                    <div className="flex flex-row gap-1 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-sm text-white/60 whitespace-nowrap">
                          500 online
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="h-2 w-2 rounded-full bg-white/30 shrink-0" />
                        <span className="text-sm text-white/60 whitespace-nowrap truncate">
                          9.8K members
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="ml-auto mb-auto w-16 h-7 mr-3 py-0 shrink-0 flex-shrink-0">
                    Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/*ill finish this another time*/}
        {/*<div className="flex flex-col items-start gap-2 w-full mr-auto">
        <h1 className="text-2xl font-semibold">Endless Customization</h1>
        <p className="text-base text-white/60">Make your profile stand out with endless customization options</p>
        <div className="relative w-full overflow-hidden pt-2 pb-2">
          <div className="grid w-full grid-cols-3 gap-2 px-2 ">
            <div className="flex items-center">
              <Marquee className="overflow-hidden" vertical>
                <div>
              <h1 className="text-2xl font-semibold">Your Name</h1>
                  <div className="py-4 px-2 border-white/10 bg-white/1 border rounded-xl mt-3">
                  </div>
                </div>
              </Marquee>
            </div>
            <div className="flex items-center">
              <div className="flex flex-col gap-2 pr-2 justify-between items-center flex-1">
                <div className="relative h-64 w-full overflow-hidden">
                  <Marquee className="overflow-hidden" vertical>
                    <div className="border border-white/10 bg-black/50 relative mx-auto flex w-full flex-col items-center justify-center gap-2 rounded-xl p-3 max-w-[180px] pt-4">
                      <div className="size-7 shrink-0 rounded-full bg-white/10" />
                      <div className="shrink-0 bg-white/10 w-10 animate-pulse size-2" />
                      <div className="shrink-0 bg-white/10 w-6 animate-pulse size-1" />
                      <div className="shrink-0 bg-white/10 w-16 h-4 animate-pulse size-2" />
                    </div>
                    <div className="border border-white/10 bg-black/50 relative mx-auto flex w-full flex-col justify-center gap-2 rounded-xl p-3 max-w-[180px] pt-4">
                      <div className="flex flex-row gap-2 items-center">
                        <div className="size-7 shrink-0 rounded-full bg-white/10" />
                        <div className="flex flex-col gap-2">
                          <div className="shrink-0 bg-white/10 w-10 animate-pulse size-2" />
                          <div className="shrink-0 bg-white/10 w-6 animate-pulse size-1" />
                        </div>
                      </div>
                      <div className="flex flex-row w-fit gap-2">
                        <div className="shrink-0 bg-white/10 w-18 h-4 animate-pulse" />
                        <div className="shrink-0 bg-white/10 w-18 h-4 animate-pulse" />
                      </div>
                    </div>
                  </Marquee>
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-background" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background" />
                </div>
              </div>
            </div>

            <div className="flex items-center flex flex-col">

            </div>
          </div>
        </div>
      </div>*/}
      </section>
    </main>
  );
}
