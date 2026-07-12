import { CalendarDays, Sun } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfToday, startOfWeek } from "@/lib/utils";
import { ensureMissions } from "@/actions/missions";
import { MissionList } from "@/components/game/mission-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "ミッション" };

/**
 * ミッション画面(デイリー / ウィークリーのクエストログ)
 */
export default async function MissionsPage() {
  const user = await requireUser();
  await ensureMissions(user.id);

  const missions = await prisma.userMission.findMany({
    where: {
      userId: user.id,
      OR: [
        { type: "DAILY", periodStart: startOfToday() },
        { type: "WEEKLY", periodStart: startOfWeek() },
      ],
    },
    include: { template: true },
    orderBy: { template: { sortOrder: "asc" } },
  });

  const toView = (m: (typeof missions)[number]) => ({
    id: m.id,
    title: m.template.title,
    progress: m.progress,
    targetCount: m.targetCount,
    completed: m.completed,
    rewardLp: m.template.rewardLp,
  });

  const daily = missions.filter((m) => m.type === "DAILY");
  const weekly = missions.filter((m) => m.type === "WEEKLY");
  const dailyDone = daily.filter((m) => m.completed).length;
  const weeklyDone = weekly.filter((m) => m.completed).length;

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up">
        <h1 className="text-2xl font-extrabold">クエストログ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          スタッフが行動をチェックすると、ミッションの進捗は自動で進みます
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-slide-up [animation-delay:100ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              デイリーミッション
            </CardTitle>
            <CardDescription>
              今日の達成: {dailyDone}/{daily.length}(毎日0時にリセット)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MissionList missions={daily.map(toView)} />
          </CardContent>
        </Card>

        <Card className="animate-slide-up [animation-delay:200ms]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-sky-500" />
              ウィークリーミッション
            </CardTitle>
            <CardDescription>
              今週の達成: {weeklyDone}/{weekly.length}(毎週月曜にリセット)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MissionList missions={weekly.map(toView)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
