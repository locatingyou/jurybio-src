"use client";
import Background from "../background";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

export default function Hero() {
  const domains = ["jury.lat"];
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDomainIndex((prev) => (prev + 1) % domains.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [domains.length]);

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center md:pt-36 overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.03)]">
      <Background />
      <section className="flex flex-col items-center text-center max-w-2xl px-4">
        <h1 className="text-6xl font-semibold tracking-tight leading-tight max-w-xl pb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          One link for everything you are.
        </h1>
        <p className="text-foreground/60 font-medium max-w-md text-lg">
          your{" "}
          <span className="font-bold text-foreground">entire presence</span>,
          one clean page.
        </p>
        <div className="flex items-center gap-2 mt-8 py-4 w-full max-w-sm">
          <InputGroup className="flex-1 py-4.5 px-1">
            <InputGroupInput
              pattern="^\S+$"
              className="ml-0 !pl-0 text-white placeholder:text-white"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              // block spaces :3
              onKeyDown={(e) => e.key === " " && e.preventDefault()}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData
                  .getData("text")
                  .replace(/\s/g, "");
                document.execCommand("insertText", false, pasted);
              }}
            />
            <InputGroupAddon>
              {/*cool thing  IF theres more than 1 domain in the const this will update so
                const domains = [
                "jury.bio"
                "pornhub.gov"
                ]
                */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentDomainIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {domains[currentDomainIndex]}/
                </motion.span>
              </AnimatePresence>
            </InputGroupAddon>
          </InputGroup>
          <Button
            asChild
            className="shrink-0 gap-1.5 rounded-2xl text-sm font-semibold text-center py-4.5 px-4"
          >
            <Link
              href={`/auth?mode=register&url=${encodeURIComponent(username)}`}
            >
              Get Started <IconArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </section>
      {/*temp placeholder for profile card*/}
      <div className="p-4 mt-12 rounded-xl w-full h-96 border-white/20 max-w-3xl bg-white/5 backdrop-blur-2xl border-[0.01px]" />
    </section>
  );
}
