import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  IconAt,
  IconConfettiFilled,
  IconEye,
  IconHash,
  IconHeartBrokenFilled,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import getAnalytics from "@/lib/api/data/analytics/getAnalytics";

type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;

export default function OverviewCards({
  username,
  uid,
  analyticsData,
}: {
  username: string;
  uid: number;
  analyticsData: AnalyticsData;
}) {
  const totalViews =
    analyticsData?.views?.reduce((sum, view) => sum + (view.count || 0), 0) ??
    0;

  const previousTotal = analyticsData?.previousPeriodViews ?? 0;
  const viewsChange =
    previousTotal > 0
      ? ((totalViews - previousTotal) / previousTotal) * 100
      : 0;
  const isPositive = viewsChange >= 0;

  return (
    // <div className="grid grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1 mt-4 space-y-4 md:space-y-0 space-x-0 md:space-x-4">
    //       </div>
    <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-4 md:grid-rows-1 mt-4 space-y-4 md:space-y-0 space-x-0 md:space-x-4">
      {/* 2x2 grid for cards */}
      <div className="grid grid-cols-2 gridgrid-rows-1 gap-4 col-span-2">
        <Card>
          <CardHeader className="flex flex-row gap-1 items-center justify-between">
            <h1 className="text-base capitalize text-muted-foreground font-medium">
              username
            </h1>
            <IconAt className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent className="mb-2">
            <span className="text-xl font-bold flex items-end gap-2">
              {username}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row gap-1 items-center justify-between">
            <h1 className="text-base capitalize text-muted-foreground font-medium">
              UID
            </h1>
            <IconHash className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent className="mb-2">
            <span className="text-xl font-bold flex items-end gap-2">
              {uid}
            </span>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader className="flex flex-row gap-1 items-center justify-between">
            <h1 className="text-base capitalize text-muted-foreground font-medium">
              Views
            </h1>
            <IconEye className="text-muted-foreground" size={20} />
          </CardHeader>
          <CardContent className="mb-2">
            <span className="text-xl font-bold flex items-end gap-2">
              {totalViews.toLocaleString()}
              <span
                className={`flex items-end gap-1 text-xs font-medium ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositive ? (
                  <IconTrendingUp size={15} />
                ) : (
                  <IconTrendingDown size={15} />
                )}
                {Math.abs(viewsChange).toFixed(1)}%
              </span>
            </span>
          </CardContent>
        </Card>
      </div>
      {/*full card for giveaways*/}
      <Card className="w-full col-span-2">
        <CardHeader className="flex flex-row gap-1 items-center">
          <IconConfettiFilled size={20} />
          <h1 className="text-base capitalize text-muted-foreground font-medium">
            Giveaways
          </h1>
        </CardHeader>
        <CardContent className="h-full">
          <div className="gap-2 flex flex-col items-center justify-center h-full">
            <IconHeartBrokenFilled
              size={50}
              className="text-muted-foreground"
            />
            <h1 className="font-medium text-[15px]">
              There are no active giveaways at this time
            </h1>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
