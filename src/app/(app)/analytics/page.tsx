import { Activity, ChartLine, Moon, Pill, Sunrise, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatDateShort, startOfToday } from "@/lib/utils";
import {
  TrendAreaChart,
  WeeklyBarChart,
  type DailyPoint,
} from "@/components/game/analytics-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "分析" };

/** ローカル日付キー(YYYY-M-D) */
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/**
 * 分析画面
 * - 週間 / 月間の獲得LP
 * - 外出率 / 服薬率 / 起床率(直近30日)
 * - 生活リズム(直近14日の起床・服薬・就寝チェック)
 * - 獲得ポイント推移(12週)
 */
export default async function AnalyticsPage() {
  const user = await requireUser();

  const today = startOfToday();
  const from84 = new Date(today);
  from84.setDate(from84.getDate() - 83); // 12週分

  const logs = await prisma.pointLog.findMany({
    where: { userId: user.id, createdAt: { gte: from84 }, points: { gt: 0 } },
    select: { createdAt: true, points: true, actionName: true },
  });

  // 日別集計マップ
  const lpByDay = new Map<string, number>();
  const actionDays = new Map<string, Set<string>>(); // actionName -> 日付キー集合
  for (const log of logs) {
    const key = dayKey(new Date(log.createdAt));
    lpByDay.set(key, (lpByDay.get(key) ?? 0) + log.points);
    if (!actionDays.has(log.actionName)) actionDays.set(log.actionName, new Set());
    actionDays.get(log.actionName)!.add(key);
  }

  // 週間活動(7日)
  const weekly: DailyPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    weekly.push({ label: formatDateShort(d), lp: lpByDay.get(dayKey(d)) ?? 0 });
  }

  // 月間活動(30日)
  const monthly: DailyPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    monthly.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      lp: lpByDay.get(dayKey(d)) ?? 0,
    });
  }

  // 獲得ポイント推移(12週・週合計)
  const trend: DailyPoint[] = [];
  for (let w = 11; w >= 0; w--) {
    let sum = 0;
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - w * 7 - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      sum += lpByDay.get(dayKey(d)) ?? 0;
    }
    trend.push({ label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}週`, lp: sum });
  }

  // 直近30日の達成率
  const rate = (actionName: string) => {
    const days = actionDays.get(actionName);
    if (!days) return 0;
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(dayKey(d))) count++;
    }
    return Math.round((count / 30) * 100);
  };

  const stats = [
    { label: "外出率", value: rate("外出"), icon: Activity, hint: "直近30日" },
    { label: "服薬率", value: rate("服薬"), icon: Pill, hint: "直近30日" },
    { label: "起床率", value: rate("起床"), icon: Sunrise, hint: "直近30日" },
    { label: "就寝達成率", value: rate("就寝時間達成"), icon: Moon, hint: "直近30日" },
  ];

  // 生活リズム(直近14日 × 起床/服薬/就寝)
  const rhythmRows = ["起床", "服薬", "就寝時間達成"] as const;
  const rhythmDays: Date[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    rhythmDays.push(d);
  }

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <ChartLine className="h-6 w-6 text-primary" />
          分析
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          自分のがんばりをグラフで振り返ろう
        </p>
      </header>

      {/* 達成率スタットタイル */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <s.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">
                {s.value}
                <span className="text-base font-bold text-muted-foreground">%</span>
              </p>
              <p className="text-[10px] text-muted-foreground">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up [animation-delay:100ms]">
          <CardHeader>
            <CardTitle className="text-base">週間活動</CardTitle>
            <CardDescription>直近7日間の獲得LP</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyBarChart data={weekly} />
          </CardContent>
        </Card>

        <Card className="animate-slide-up [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="text-base">月間活動</CardTitle>
            <CardDescription>直近30日間の獲得LP</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={monthly} />
          </CardContent>
        </Card>

        <Card className="animate-slide-up [animation-delay:300ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              獲得ポイント推移
            </CardTitle>
            <CardDescription>週ごとの合計(12週間)</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendAreaChart data={trend} />
          </CardContent>
        </Card>

        {/* 生活リズム */}
        <Card className="animate-slide-up [animation-delay:400ms]">
          <CardHeader>
            <CardTitle className="text-base">生活リズム</CardTitle>
            <CardDescription>直近14日間のチェック状況(●=達成)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto thin-scrollbar">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-1 text-left font-medium text-muted-foreground">項目</th>
                    {rhythmDays.map((d) => (
                      <th key={d.toISOString()} className="p-1 text-center font-normal text-muted-foreground">
                        {d.getDate()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rhythmRows.map((row) => (
                    <tr key={row}>
                      <td className="whitespace-nowrap p-1 font-medium">{row}</td>
                      {rhythmDays.map((d) => {
                        const done = actionDays.get(row)?.has(dayKey(d)) ?? false;
                        return (
                          <td key={d.toISOString()} className="p-1 text-center">
                            <span
                              className={cn(
                                "mx-auto block h-3 w-3 rounded-full",
                                done ? "bg-[#0284c7]" : "bg-muted"
                              )}
                              aria-label={done ? "達成" : "未達成"}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
