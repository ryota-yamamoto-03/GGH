import { Medal } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "ランキング" };

interface RankedUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  points: number;
}

/**
 * 期間内のポイント獲得合計でユーザーを集計する。
 * from が null の場合は累計(totalEarnedLp)を使用。
 */
async function getRanking(from: Date | null): Promise<RankedUser[]> {
  const visibleUsers = await prisma.user.findMany({
    where: { role: "USER", isActive: true, showInRanking: true },
    select: { id: true, name: true, avatarUrl: true, totalEarnedLp: true },
  });

  if (!from) {
    return visibleUsers
      .map((u) => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl, points: u.totalEarnedLp }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
  }

  const grouped = await prisma.pointLog.groupBy({
    by: ["userId"],
    where: {
      points: { gt: 0 },
      createdAt: { gte: from },
      userId: { in: visibleUsers.map((u) => u.id) },
    },
    _sum: { points: true },
  });

  const sumMap = new Map(grouped.map((g) => [g.userId, g._sum.points ?? 0]));
  return visibleUsers
    .map((u) => ({
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      points: sumMap.get(u.id) ?? 0,
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 20);
}

function RankingList({ users, myId }: { users: RankedUser[]; myId: string }) {
  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        まだデータがありません
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {users.map((u, i) => {
        return (
          <li
            key={u.id}
            className={cn(
              "animate-slide-up flex items-center gap-3 rounded-xl border p-3 transition-all",
              i < 3 && "neon-border",
              u.id === myId && "bg-primary/5 ring-1 ring-primary/40"
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
                i === 0 && "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md",
                i === 1 && "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md",
                i === 2 && "bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-md",
                i > 2 && "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <Avatar className="h-10 w-10">
              <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
              <AvatarFallback>{u.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {u.name}
                {u.id === myId && (
                  <Badge variant="secondary" className="ml-2">自分</Badge>
                )}
              </p>
            </div>
            <span className="shrink-0 text-lg font-extrabold tabular-nums text-game-gradient">
              {u.points.toLocaleString()} LP
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * ランキング画面(累計 / 今月 / 年間)
 * 管理者設定でOFFの場合は非表示メッセージを表示。
 */
export default async function RankingPage() {
  const user = await requireUser();

  const setting = await prisma.appSetting.findUnique({
    where: { key: "ranking_enabled" },
  });
  const enabled = setting?.value !== "false";

  if (!enabled) {
    return (
      <div className="container py-6">
        <Card className="animate-slide-up">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Medal className="mx-auto mb-3 h-10 w-10 opacity-40" />
            ランキングは現在オフになっています
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [total, monthly, yearly] = await Promise.all([
    getRanking(null),
    getRanking(monthStart),
    getRanking(yearStart),
  ]);

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <Medal className="h-6 w-6 text-cyan-500" />
          ランキング
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ※ 競争ではなく、みんなの成長を一緒に喜ぶためのページです。表示したくない場合はホームからOFFにできます。
        </p>
      </header>

      <Tabs defaultValue="total" className="animate-slide-up [animation-delay:100ms]">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="total" className="flex-1 sm:flex-none">累計PT</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 sm:flex-none">今月</TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1 sm:flex-none">年間</TabsTrigger>
        </TabsList>
        <TabsContent value="total">
          <RankingList users={total} myId={user.id} />
        </TabsContent>
        <TabsContent value="monthly">
          <RankingList users={monthly} myId={user.id} />
        </TabsContent>
        <TabsContent value="yearly">
          <RankingList users={yearly} myId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
