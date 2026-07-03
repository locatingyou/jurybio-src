import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

type ViewRow = {
  date: string;
  device: string;
  count: number;
};

const RANGE_TO_DAYS: Record<string, number> = {
  "24hrs": 1,
  "3d": 3,
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "365d": 365,
};

export default function ViewsChart({
  data,
  timeRange,
}: {
  data?: ViewRow[];
  timeRange: string;
}) {
  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    desktop: {
      label: "Desktop",
      color: "var(--chart-1)",
    },
    mobile: {
      label: "Mobile",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  // pivot long rows (one per date+device) into wide rows ({ date, desktop, mobile })
  const pivoted = (data ?? []).reduce<
    Record<string, { date: string; desktop: number; mobile: number }>
  >((acc, row) => {
    if (!acc[row.date]) {
      acc[row.date] = { date: row.date, desktop: 0, mobile: 0 };
    }
    if (row.device === "desktop" || row.device === "mobile") {
      acc[row.date][row.device] = row.count;
    }
    return acc;
  }, {});

  // fill in every date in the range, defaulting to 0 views, so quiet days
  // still get a tick and a flat point instead of disappearing
  const numDays = RANGE_TO_DAYS[timeRange] ?? 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chartData: { date: string; desktop: number; mobile: number }[] = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD, matches your SQL DATE() output
    chartData.push(pivoted[key] ?? { date: key, desktop: 0, mobile: 0 });
  }

  function autoFormatDays(days: string) {
    const map: Record<string, string> = {
      "24hrs": "24 hours",
      "3d": "3 days",
      "7d": "7 days",
      "14d": "2 weeks",
      "30d": "month",
      "90d": "3 months",
      "365d": "year",
    };
    return map[days] ?? days;
  }

  return (
    <Card className="w-full h-74">
      <CardContent>
        <h1 className="text-base font-semibold">
          Total Views in the last {autoFormatDays(timeRange)}
        </h1>
        <div className="w-full pt-2 px-2">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[230px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { weekday: "short" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="mobile"
                type="monotone"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="monotone"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
