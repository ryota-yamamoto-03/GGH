import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Gift,
  Medal,
  Sun,
  Target,
  Trophy,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcLevel } from "@/lib/level";
import { formatDateTime, startOfToday, startOfWeek } from "@/lib/utils";
import { ensureMissions } from "@/actions/missions";
import { LevelCard } from "@/components/game/level-card";
import { MissionList } from "@/components/game/mission-list";
import { RankingToggle } from "@/components/game/ranking-toggle";
import { DynamicIcon } from "@/components/icon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export const metadata = { title: "ホーム" };

/**
 * ホーム画面(ゲームのステータス画面風)
 */
export default async function DashboardPage() {
  const user = await requireUser();

  // 今日/今週のミッションを自動生成
  await ensureMissions(user.id);

  const today = startOfToday();
  const week = startOfWeek();

  const [missions, achievements, recentLogs, exchanges, rankingSetting, topUsers] =
    await Promise.all([
      prisma.userMission.findMany({
        where: {
          userId: user.id,
          OR: [
            { type: "DAILY", periodStart: today },
            { type: "WEEKLY", periodStart: week },
          ],
        },
        include: { template: true },
        orderBy: { template: { sortOrder: "asc" } },
      }),
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: true },
        orderBy: { unlockedAt: "desc" },
        take: 4,
      }),
      prisma.pointLog.findMany({
        where: { userId: user.id, points: { gt: 0 } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.rewardExchange.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.appSetting.findUnique({ where: { key: "ranking_enabled" } }),
      prisma.user.findMany({
        where: { role: "USER", isActive: true, showInRanking: true },
        orderBy: { totalEarnedLp: "desc" },
        take: 3,
        select: { id: true, name: true, avatarUrl: true, totalEarnedLp: true },
      }),
    ]);

  const levelInfo = calcLevel(user.totalEarnedLp);
  const dailyMissions = missions.filter((m) => m.type === "DAILY");
  const weeklyMissions = missions.filter((m) => m.type === "WEEKLY");
  const rankingEnabled = rankingSetting?.value !== "false";

  const toView = (m: (typeof missions)[number]) => ({
    id: m.id,
    title: m.template.title,
    progress: m.progress,
    targetCount: m.targetCount,
    completed: m.completed,
    rewardLp: m.template.rewardLp,
  });

  return (
    <div className="container space-y-6 py-6">
      {/* ステータスカード */}
      <LevelCard
        name={user.name}
        avatarUrl={user.avatarUrl}
        currentLp={user.currentLp}
        totalEarnedLp={user.totalEarnedLp}
        levelInfo={levelInfo}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 今日のミッション */}
        <Card className="animate-slide-up [animation-delay:100ms]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sun className="h-5 w-5 text-amber-500" />
              今日のミッション
            </CardTitle>
            <Link href="/missions" className="text-xs text-primary hover:underline">
              すべて見る
            </Link>
          </CardHeader>
          <CardContent>
            <MissionList missions={dailyMissions.map(toView)} />
          </CardContent>
        </Card>

        {/* 週間ミッション */}
        <Card className="animate-slide-up [animation-delay:200ms]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-sky-500" />
              週間ミッション
            </CardTitle>
            <Link href="/missions" className="text-xs text-primary hover:underline">
              すべて見る
            </Link>
          </CardHeader>
          <CardContent>
            <MissionList missions={weeklyMissions.map(toView)} />
          </CardContent>
        </Card>

        {/* 実績 */}
        <Card className="animate-slide-up [animation-delay:300ms]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-yellow-500" />
              最近の実績
            </CardTitle>
            <Link href="/achievements" className="text-xs text-primary hover:underline">
              すべて見る
            </Link>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                行動すると実績がアンロックされます
              </p>
            ) : (
              <ul className="space-y-3">
                {achievements.map((ua) => (
                  <li key={ua.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md">
                      <DynamicIcon name={ua.achievement.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {ua.achievement.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {ua.achievement.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ランキング(ON時のみ) */}
        {rankingEnabled && (
          <Card className="animate-slide-up [animation-delay:400ms]">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Medal className="h-5 w-5 text-cyan-500" />
                ランキング TOP3
              </CardTitle>
              <RankingToggle initial={user.showInRanking} />
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {topUsers.map((u, i) => (
                  <li key={u.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                        i === 0
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                          : i === 1
                            ? "bg-gradient-to-br from-gray-400 to-gray-500"
                            : "bg-gradient-to-br from-amber-600 to-orange-700"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
                      <AvatarFallback className="text-xs">{u.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {u.name}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-primary">
                      {u.totalEarnedLp.toLocaleString()} LP
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/ranking"
                className="mt-3 flex items-center justify-end gap-1 text-xs text-primary hover:underline"
              >
                ランキングを見る <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 最近獲得したポイント */}
        <Card className="animate-slide-up [animation-delay:500ms]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-emerald-500" />
              最近獲得したポイント
            </CardTitle>
            <Link href="/history" className="text-xs text-primary hover:underline">
              履歴
            </Link>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                まだポイント履歴がありません
              </p>
            ) : (
              <ul className="space-y-2.5">
                {recentLogs.map((log) => (
                  <li key={log.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{log.actionName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold tabular-nums text-emerald-500">
                      +{log.points} LP
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ポイント交換履歴 */}
        <Card className="animate-slide-up [animation-delay:600ms]">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="h-5 w-5 text-pink-500" />
              ポイント交換履歴
            </CardTitle>
            <Link href="/shop" className="text-xs text-primary hover:underline">
              交換所へ
            </Link>
          </CardHeader>
          <CardContent>
            {exchanges.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                まだ交換履歴がありません
              </p>
            ) : (
              <ul className="space-y-2.5">
                {exchanges.map((ex) => (
                  <li key={ex.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ex.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(ex.createdAt)} ・{" "}
                        {ex.status === "PENDING"
                          ? "申請中"
                          : ex.status === "APPROVED"
                            ? "手配中"
                            : ex.status === "DELIVERED"
                              ? "お渡し済み"
                              : "キャンセル"}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold tabular-nums text-rose-500">
                      -{ex.costLp} LP
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
