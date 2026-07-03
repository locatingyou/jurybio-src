"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TotalCards from "../_components/analytics/total-cards";
import { useEffect, useState } from "react";
import ViewsChart from "../_components/analytics/views-chart";
import DevicesCard from "../_components/analytics/devices-card";
import getAnalytics from "@/lib/api/data/analytics/getAnalytics";
type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("24hrs");
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
    <div className="py-4 px-4">
      <div className="w-full">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              {/* 24 Hours? https://open.spotify.com/track/0AlTIOiF5u0sHdsEvBU2av?si=4c25a741b3ec46eb */}
              <SelectItem value="24hrs">Last 24 Hours</SelectItem>
              <SelectItem value="3d">Last 3 Days</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="14d">Last 2 Weeks</SelectItem>
              <SelectItem value="30d">Last Month</SelectItem>
              <SelectItem value="365d">Last Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <TotalCards
        totalProfileViews={(data?.views ?? []).reduce(
          (sum, row) => sum + Number(row.count),
          0,
        )}
        days={timeRange}
      />
      <div className="mt-4 grid grid-cols-1 grid-rows-2 md:grid-cols-5 md:grid-rows-1 gap-4">
        <div className="col-span-1 md:col-span-4">
          <ViewsChart data={data?.views} timeRange={timeRange} />
        </div>
        <DevicesCard timeRange={timeRange} />
      </div>
    </div>
  );
}
