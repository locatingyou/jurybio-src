"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconBadgeFilled,
  IconChartAreaLine,
  IconDeviceDesktop,
  IconDots,
  IconFolderFilled,
  IconLayoutGridFilled,
  IconLink,
  IconLogout,
  IconSettings,
  IconUserFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PiPaintBrushFill } from "react-icons/pi";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/app/dashboard/_user-provider";

interface NavLink {
  icon: React.ReactNode;
  name: string;
  url: string;
}

const navGeneral: NavLink[] = [
  {
    icon: <IconDeviceDesktop size={17} />,
    name: "Overview",
    url: "/dashboard",
  },
  // {
  //   icon: <IconChartAreaLine size={17} />,
  //   name: "Analytics",
  //   url: "/dashboard/analytics",
  // },
];

const navCustomize: NavLink[] = [
  {
    icon: <IconUserFilled size={17} />,
    name: "Profile",
    url: "/dashboard/profile",
  },
  {
    icon: <PiPaintBrushFill size={17} />,
    name: "Appearance",
    url: "/dashboard/profile?tab=appearance",
  },
  {
    icon: <IconLink size={17} />,
    name: "Links",
    url: "/dashboard/profile?tab=links",
  },
  {
    icon: <IconLayoutGridFilled size={17} />,
    name: "Widgets",
    url: "/dashboard/profile?tab=widgets",
  },
  {
    icon: <IconBadgeFilled size={17} />,
    name: "Badges",
    url: "/dashboard/profile?tab=badges",
  },
  // {
  //   icon: <IconFolderFilled size={17} />,
  //   name: "Templates",
  //   url: "/dashboard/profile?tab=templates",
  // },
];

function NavItem({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [urlPath, urlQuery] = item.url.split("?");
  const pathMatches = pathname === urlPath;
  const queryMatches = urlQuery
    ? Array.from(new URLSearchParams(urlQuery).entries()).every(
        ([k, v]) => searchParams.get(k) === v,
      )
    : !searchParams.toString();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={pathMatches && queryMatches}
        className="py-5 text-[15px] gap-2"
      >
        <Link href={item.url}>
          {item.icon}
          {item.name}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {}) {
  const router = useRouter();
  const { user } = useUser();
  const isMobile = useIsMobile();
  const { state } = useSidebar();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 flex flex-row items-center">
        <div className="relative h-10 w-10">
          <Image
            src={
              state === "collapsed" ? "/logo_transparent.webp" : "/logo.webp"
            }
            fill
            alt="logo"
            className="absolute rounded-md object-cover"
          />
        </div>
        <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">
          jury.lat
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu className="flex flex-col gap-2">
            {navGeneral.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Profile</SidebarGroupLabel>
          <SidebarMenu className="flex flex-col gap-2">
            {navCustomize.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full rounded-lg h-12 justify-start px-3 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                >
                  <div className="relative h-8 w-8 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 flex-shrink-0">
                    <Image
                      src={
                        user?.config?.avatar_url ??
                        "https://cdn.discordapp.com/embed/avatars/0.png"
                      }
                      alt="avatar"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      {user?.username}
                    </span>
                  </div>
                  <IconDots className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mb-2">
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <IconSettings />
                  Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
