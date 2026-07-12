import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcLevel } from "@/lib/level";
import { startOfToday } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "スタッフ" };

/**
 * スタッフ画面: 利用者一覧
 * 今日のチェック数・保留中の交換申請を確認できる
 */
export default async function StaffPage() {
  await requireRole("STAFF", "ADMIN");

  const today = startOfToday();

  const [users, todayLogs, pendingExchanges] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER", isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.pointLog.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: today }, points: { gt: 0 } },
      _count: { id: true },
      _sum: { points: true },
    }),
    prisma.rewardExchange.count({ where: { status: "PENDING" } }),
  ]);

  const todayMap = new Map(
    todayLogs.map((t) => [t.userId, { count: t._count.id, sum: t._sum.points ?? 0 }])
  );

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Users className="h-6 w-6 text-primary" />
            利用者一覧
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            利用者を選んで今日の行動をチェックしましょう
          </p>
        </div>
        {pendingExchanges > 0 && (
          <Badge variant="destructive" className="animate-pop-in">
            交換申請 {pendingExchanges}件 待ち
          </Badge>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u, i) => {
          const level = calcLevel(u.totalEarnedLp);
          const todayStat = todayMap.get(u.id);
          return (
            <Link key={u.id} href={`/staff/users/${u.id}`}>
              <Card
                className="animate-slide-up group h-full transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/60 hover:shadow-lg"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
                    <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Lv{level.level} {level.rank.name} ・ {u.currentLp.toLocaleString()} LP
                    </p>
                    <p className="mt-1 text-xs">
                      {todayStat ? (
                        <span className="font-medium text-emerald-500">
                          今日 {todayStat.count}件チェック(+{todayStat.sum} LP)
                        </span>
                      ) : (
                        <span className="text-muted-foreground">今日は未チェック</span>
                      )}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {users.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            利用者がまだ登録されていません。利用者が Google ログインすると自動で表示されます。
          </p>
        )}
      </div>
    </div>
  );
}
