import { History } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const metadata = { title: "ポイント履歴" };

/**
 * 自分のポイント履歴(獲得・消費の全記録)
 */
export default async function HistoryPage() {
  const user = await requireUser();

  const logs = await prisma.pointLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { grantedBy: { select: { name: true } } },
  });

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <History className="h-6 w-6 text-primary" />
          ポイント履歴
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">直近100件を表示しています</p>
      </header>

      <Card className="animate-slide-up [animation-delay:100ms]">
        <CardHeader>
          <CardTitle className="text-base">すべての増減</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              まだ履歴がありません
            </p>
          ) : (
            <ul className="divide-y">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{log.actionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                      {log.grantedBy && ` ・ 確認: ${log.grantedBy.name}`}
                      {log.note && ` ・ ${log.note}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-bold tabular-nums",
                      log.points >= 0 ? "text-emerald-500" : "text-rose-500"
                    )}
                  >
                    {log.points >= 0 ? "+" : ""}
                    {log.points} LP
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
