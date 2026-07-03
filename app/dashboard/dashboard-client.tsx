"use client";
import Link from "next/link";
import OverviewCards from "./_components/overview/cards";
import ProfileCompletion from "./_components/overview/profile-completion";
import ViewsChart from "./_components/analytics/views-chart";
import DevicesCard from "./_components/analytics/devices-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import QuickActions from "./_components/overview/quick-actions";
import getAnalytics from "@/lib/api/data/analytics/getAnalytics";

type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

export default function DashboardClientPage({
  username,
  uid,
  is_avatar_uploaded,
  is_description_added,
  is_account_connected,
  is_links_added,
  claimed_badge_ids,
}: {
  username: string;
  uid: number;
  is_avatar_uploaded: boolean;
  is_description_added: boolean;
  is_links_added: boolean;
  is_account_connected: boolean;
  claimed_badge_ids: string[];
}) {
  const [timeRange, setTimeRange] = useState("90d");
  const [data, setData] = useState<AnalyticsData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAnalytics({ timeRange }).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [timeRange]);
  return (
    <main className="py-6 px-4 md:px-8 w-full mx-auto overflow-y-auto overflow-x-hidden">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-foreground font-bold text-xl">
            Welcome back, {username}!
          </h1>
          <span className="text-muted-foreground text-base">
            Here&apos;s a quick look at your{" "}
            <Link
              href={"/"}
              className="font-bold text-foreground underline underline-offset-6"
            >
              jury.lat
            </Link>{" "}
            page.
          </span>
        </div>
        <Tabs defaultValue="90d" value={timeRange} onValueChange={setTimeRange}>
          <TabsList className="border bg-white/2 px-2">
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
            <TabsTrigger value="90d">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <OverviewCards username={username} uid={uid} analyticsData={data} />
      <ProfileCompletion
        is_2fa_enabled={false}
        is_account_connected={is_account_connected}
        is_avatar_uploaded={is_avatar_uploaded}
        is_description_added={is_description_added}
        is_links_added={is_links_added}
        claimed_badge_ids={claimed_badge_ids}
      />
      <div className="mt-4 grid grid-cols-1 grid-rows-2 md:grid-cols-3 md:grid-rows-1 gap-4">
        <div className="col-span-1 md:col-span-2">
          <ViewsChart data={data?.views} timeRange={timeRange} />
        </div>
        <QuickActions
          username={username}
          is_account_connected={is_account_connected}
        />
      </div>
    </main>
  );
}
