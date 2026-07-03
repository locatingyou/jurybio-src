"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarCollapse, SidebarTrigger } from "@/components/ui/sidebar";
import { FaChevronRight } from "react-icons/fa";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

function toLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function LabelRoutes(pathname: string) {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment, i, arr) => ({
      label: toLabel(segment),
      href: "/" + arr.slice(0, i + 1).join("/"),
    }));
}

export function SiteHeader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const segments = LabelRoutes(pathname);
  const currentPage = segments[segments.length - 1];

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 md:hidden flex" />
        <SidebarCollapse className="sm:flex hidden" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-full md:hidden flex"
        />
        <div className="flex flex-row items-center gap-2 text-center">
          <Link
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            href="/dashboard"
          >
            Dashboard
          </Link>
          <FaChevronRight className="text-primary h-3 w-3" />
          {tab ? (
            <>
              <Link
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                href={currentPage?.href ?? "/dashboard"}
              >
                {currentPage?.label}
              </Link>
              <FaChevronRight className="text-primary h-3 w-3" />
              <h1 className="text-sm font-medium">{toLabel(tab)}</h1>
            </>
          ) : (
            <h1 className="text-sm font-medium">{currentPage?.label}</h1>
          )}
        </div>
      </div>
    </header>
  );
}
