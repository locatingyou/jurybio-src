"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconEdit,
  IconLink,
  IconLoader2,
  IconPencil,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { FaDiscord } from "react-icons/fa6";
import Link from "next/link";
import { toast } from "sonner";

export default function QuickActions({
  username,
  is_account_connected,
}: {
  username: string;
  is_account_connected: boolean;
}) {
  const [isDisconnectingDiscord, setIsDisconnectingDiscord] = useState(false);
  const [isConnected, setIsConnected] = useState(is_account_connected);
  const handleDisconnectDiscord = async () => {
    setIsDisconnectingDiscord(true);
    try {
      const res = await fetch("/api/discord/disconnect", {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("Disconnected Discord account");
      setIsConnected(false);
    } catch {
      toast.error("Failed to disconnect Discord account");
    } finally {
      setIsDisconnectingDiscord(false);
    }
  };

  return (
    <Card className="w-full col-span-1 md:col-span-1">
      <CardContent className="flex flex-col">
        <h1 className="text-base font-semibold mb-4">Quick Actions</h1>
        <div className="flex flex-col gap-2">
          <Button
            className="flex items-center justify-start flex-row pl-4 rounded-xl"
            size={"lg"}
            variant={"outline"}
          >
            <IconPencil size={15} /> Change Username
          </Button>
          <Button
            disabled
            className="flex items-center justify-start flex-row pl-4 rounded-xl"
            size={"lg"}
            variant={"outline"}
          >
            <IconLink size={15} /> View Aliases
          </Button>
          <Button
            className="flex items-center justify-start flex-row pl-4 rounded-xl"
            size={"lg"}
            variant={"outline"}
            asChild
          >
            <Link href={"/profile"}>
              <IconEdit size={15} /> Edit Profile
            </Link>
          </Button>
          <Button
            className="flex items-center justify-start flex-row pl-4 rounded-xl"
            size={"lg"}
            variant={"outline"}
            asChild
          >
            <Link href={"/settings"}>
              <IconSettings size={15} /> Account Settings
            </Link>
          </Button>
          <div className="flex flex-row gap-2 w-full">
            <Button
              className="flex flex-1 items-center justify-start flex-row pl-4 rounded-xl"
              size={"lg"}
              disabled={isConnected}
              variant={"discord"}
              asChild
            >
              <Link href="/api/auth/discord">
                <FaDiscord size={15} /> Connect Discord
              </Link>
            </Button>
            <Button
              className="flex items-center justify-center flex-row rounded-xl"
              onClick={handleDisconnectDiscord}
              disabled={!isConnected || isDisconnectingDiscord}
              size={"icon-lg"}
              variant={"destructive"}
            >
              {isDisconnectingDiscord ? (
                <IconLoader2 size={15} className="animate-spin" />
              ) : (
                <IconX size={15} />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
