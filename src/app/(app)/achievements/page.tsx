import { Lock, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatDateTime } from "@/lib/utils";
import { DynamicIcon } from "@/components/icon";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";
export const metadata = { title: "実績" };

/**
 * 実績画面(Steam実績風のグリッド)
 * 解除済み: カラー表示 / 未解除: グレーアウト / 隠し実績: ??? 表示
 */
export default async function AchievementsPage() {
  const user = await requireUser();

  const [achievements, unlocked] = await Promise.all([
    prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.userAchievement.findMany({ where: { userId: user.id } }),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u]));
  const unlockedCount = achievements.filter((a) => unlockedMap.has(a.id)).length;
  const percent = achievements.length
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <Trophy className="h-6 w-6 text-yellow-500" />
          実績
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={percent} className="max-w-xs" />
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {unlockedCount}/{achievements.length}({percent}%)
          </span>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a, i) => {
          const ua = unlockedMap.get(a.id);
          const isUnlocked = Boolean(ua);
          const hidden = a.isSecret && !isUnlocked;

          return (
            <li
              key={a.id}
              className={cn(
                "animate-slide-up rounded-2xl border p-4 transition-all duration-300",
                isUnlocked
                  ? "neon-border bg-card hover:-translate-y-0.5 hover:shadow-lg"
                  : "bg-muted/40 opacity-70"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md",
                    isUnlocked
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {hidden ? (
                    <Lock className="h-6 w-6" />
                  ) : (
                    <DynamicIcon name={a.icon} className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{hidden ? "???" : a.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {hidden ? "この実績は解除するまで秘密です" : a.description}
                  </p>
                  {a.bonusLp > 0 && !hidden && (
                    <p className="mt-1 text-xs font-semibold text-primary">
                      ボーナス +{a.bonusLp} LP
                    </p>
                  )}
                  {ua && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDateTime(ua.unlockedAt)} に解除
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
