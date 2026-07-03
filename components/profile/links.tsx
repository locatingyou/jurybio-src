"use client";
import { useState } from "react";
import { Config } from "@/lib/types/profile";
import { SecondaryCard } from "./card";
import { getIcon, getColor } from "@/lib/links";
import type { IconType } from "react-icons";
import { CSSProperties } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BsExclamationLg } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";

function getPlatformLabel(icon: string) {
  if (icon === "custom") return "Link";
  if (icon === "AppleMusic") return "Apple Music";
  return icon.charAt(0).toUpperCase() + icon.slice(1);
}

export default function Links({
  config,
  align = "center",
}: {
  config: Config;
  align?: "left" | "center";
}) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeLinks = config.links?.filter((l) => l.enabled) || [];
  if (activeLinks.length === 0) return null;

  return (
    <>
      <div
        className={`flex flex-row gap-4 flex-wrap z-10 w-full ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        <TooltipProvider delayDuration={200}>
          {activeLinks.map((link) => {
            const Icon = getIcon(link.icon) as IconType;
            const color = link.color || getColor(link.icon) || "#ffffff";
            const isHttp = link.url.startsWith("http");
            const label = getPlatformLabel(link.icon);
            const isCopied = copiedId === link.id;

            const content = (
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-120"
                style={
                  {
                    color: color,
                  } as CSSProperties
                }
              >
                {Icon ? (
                  <Icon className="w-full h-full" />
                ) : (
                  <div className="">{link.icon[0]?.toUpperCase()}</div>
                )}
              </div>
            );

            const trigger = isHttp ? (
              <button
                key={link.id}
                onClick={() => setPendingUrl(link.url)}
                className="outline-none cursor-pointer"
              >
                {content}
              </button>
            ) : (
              <button
                key={link.id}
                onClick={() => {
                  navigator.clipboard.writeText(link.url);
                  setCopiedId(link.id);
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="outline-none cursor-pointer"
              >
                {content}
              </button>
            );

            return (
              <Tooltip key={link.id} open={isCopied ? true : undefined}>
                <TooltipTrigger asChild>{trigger}</TooltipTrigger>
                <TooltipContent>
                  {isCopied ? "Copied to clipboard!" : label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <Dialog
        open={!!pendingUrl}
        onOpenChange={(open) => {
          if (!open) setPendingUrl(null);
        }}
      >
        <DialogContent
          className="sm:max-w-md bg-black/50 backdrop-blur-xl border-white/10 p-6 gap-0 overflow-hidden focus-visible:ring-0 ring-0"
          autoFocus={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AnimatePresence>
            {pendingUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                <header className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BsExclamationLg className="text-primary text-lg" />
                    <h2 className="text-xl font-bold">Redirect Notice</h2>
                  </div>
                  <p className="text-zinc-400 text-sm">
                    You are about to be redirected to an external site
                  </p>
                </header>
                <code className="block px-3 py-2 bg-zinc-900/50 rounded border border-zinc-800 text-sm text-center font-mono break-all">
                  {pendingUrl}
                </code>
                <footer className="flex gap-3 justify-center pt-1">
                  <button
                    onClick={() => setPendingUrl(null)}
                    className="inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-medium bg-zinc-950/25 backdrop-blur-lg text-white border border-zinc-900 hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={() => {
                      if (pendingUrl) {
                        window.open(
                          pendingUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                      }
                      setPendingUrl(null);
                    }}
                  >
                    Visit
                  </Button>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
