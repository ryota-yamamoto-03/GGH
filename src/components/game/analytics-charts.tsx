"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * 分析画面のグラフ群(recharts)
 * シリーズ色は #0284c7(ライト/ダーク両サーフェスでコントラスト検証済み)
 */
const SERIES_COLOR = "#0284c7";
const GRID_COLOR = "rgba(148, 163, 184, 0.2)";
const AXIS_COLOR = "#94a3b8";

export interface DailyPoint {
  label: string;
  lp: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-bold tabular-nums">
        {payload[0].value.toLocaleString()} LP
      </p>
    </div>
  );
}

/** 週間活動: 直近7日の獲得LP(棒グラフ) */
export function WeeklyBarChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: GRID_COLOR }} />
        <Bar
          dataKey="lp"
          fill={SERIES_COLOR}
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
          isAnimationActive
          animationDuration={800}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 月間活動 / 獲得ポイント推移: エリアチャート */
export function TrendAreaChart({ data }: { data: DailyPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="lpFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.3} />
            <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID_COLOR} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="lp"
          stroke={SERIES_COLOR}
          strokeWidth={2}
          fill="url(#lpFill)"
          isAnimationActive
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
