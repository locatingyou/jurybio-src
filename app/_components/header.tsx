"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center h-[52px] px-4 gap-2 rounded-full bg-black/60 border border-white/[0.07] backdrop-blur-xl shadow-[0_4px_24px_#00000080,inset_0_1px_0_#ffffff26]">
          <Button variant="ghost" size="icon" className="rounded-full p-0 h-8 w-8 hover:bg-transparent" asChild>
            <Link href="/">
              <Image
                src="/logo.webp"
                alt="logo"
                width={32}
                height={32}
                className="rounded-full hover:opacity-80 transition-opacity"
              />
            </Link>
          </Button>
          <nav className="hidden md:flex items-center gap-0.5">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className="px-2.5 py-1.5 text-[13px] text-white/50 hover:text-white hover:bg-white/[0.06] rounded-full h-auto"
                asChild
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="w-[34px] h-[34px] rounded-full text-white/30 hover:text-white hover:bg-white/[0.06]"
            asChild
          >
            <Link href="/dashboard">
              <MdDashboard className="w-[18px] h-[18px]" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-[30px] h-[30px] text-white/30 hover:text-white hover:bg-transparent"
            aria-label="Toggle menu"
          >
            <FiChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="mt-2 rounded-[20px] bg-black/60 border border-white/[0.06] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden"
            >
              <nav className="flex flex-col p-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="justify-start px-4 py-3 text-[13px] text-white/40 hover:text-white hover:bg-white/[0.05] rounded-xl h-auto"
                    onClick={() => setMobileOpen(false)}
                    asChild
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}