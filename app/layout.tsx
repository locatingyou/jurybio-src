import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { allFonts, satoshi } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Jury",
  description: "a simplistic biolink with all your needs.",
  icons: {
    icon: "/favicon.ico",
  },
};

const fontVariables = allFonts.map((f) => f.variable).join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVariables} ${satoshi.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
