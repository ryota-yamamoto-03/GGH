import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, MessageSquare } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcLevel } from "@/lib/level";
import { cn, formatDateTime, startOfToday } from "@/lib/utils";
import { ActionCheckGrid } from "@/components/staff/action-check-grid";
import { NoteForm } from "@/components/staff/note-forms";
import { ExchangeStatusButtons } from "@/components/staff/exchange-status-buttons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "利用者詳細" };

/**
 * スタッフ画面: 利用者詳細
 * - 今日の行動チェック(タップで自動加算)
 * - ポイント履歴 / コメント / 支援記録 / 交換申請
 * - CSV出力
 */
export default async function StaffUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireRole("STAFF", "ADMIN");

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  const today = startOfToday();

  const [actions, todayLogs, recentLogs, comments, records, exchanges] =
    await Promise.all([
      prisma.pointAction.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.pointLog.findMany({
        where: { userId: user.id, createdAt: { gte: today } },
      }),
      prisma.pointLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { grantedBy: { select: { name: true } } },
      }),
      prisma.staffComment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { staff: { select: { name: true } } },
      }),
      prisma.supportRecord.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        take: 20,
        include: { staff: { select: { name: true } } },
      }),
      prisma.rewardExchange.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const level = calcLevel(user.totalEarnedLp);
  const todayCountByAction = new Map<string, number>();
  for (const log of todayLogs) {
    if (log.actionId) {
      todayCountByAction.set(
        log.actionId,
        (todayCountByAction.get(log.actionId) ?? 0) + 1
      );
    }
  }

  return (
    <div className="container space-y-6 py-6">
      {/* ヘッダー */}
      <header className="animate-slide-up">
        <Link
          href="/staff"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          利用者一覧へ戻る
        </Link>
        <div className="glass-panel flex flex-wrap items-center gap-4 p-5">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xl">{user.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              Lv{level.level} {level.rank.name} ・ 所持 {user.currentLp.toLocaleString()} LP ・
              累計 {user.totalEarnedLp.toLocaleString()} LP
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/export/points?userId=${user.id}`} download>
              <Download className="h-4 w-4" />
              CSV出力
            </a>
          </Button>
        </div>
      </header>

      {/* 今日の行動チェック */}
      <Card className="animate-slide-up [animation-delay:100ms]">
        <CardHeader>
          <CardTitle className="text-base">今日の行動チェック</CardTitle>
          <p className="text-xs text-muted-foreground">
            タップするとポイントが自動加算され、ミッション・実績も自動更新されます
          </p>
        </CardHeader>
        <CardContent>
          <ActionCheckGrid
            userId={user.id}
            actions={actions.map((a) => ({
              id: a.id,
              name: a.name,
              points: a.points,
              icon: a.icon,
              category: a.category,
              todayCount: todayCountByAction.get(a.id) ?? 0,
            }))}
          />
        </CardContent>
      </Card>

      {/* タブ: 履歴 / コメント / 支援記録 / 交換 */}
      <Tabs defaultValue="history" className="animate-slide-up [animation-delay:200ms]">
        <TabsList className="w-full flex-wrap sm:w-auto">
          <TabsTrigger value="history" className="flex-1 sm:flex-none">ポイント履歴</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1 sm:flex-none">コメント</TabsTrigger>
          <TabsTrigger value="records" className="flex-1 sm:flex-none">支援記録</TabsTrigger>
          <TabsTrigger value="exchanges" className="flex-1 sm:flex-none">交換申請</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              {recentLogs.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">履歴なし</p>
              ) : (
                <ul className="divide-y">
                  {recentLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{log.actionName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                          {log.grantedBy && ` ・ ${log.grantedBy.name}`}
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
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4" />
                コメントを書く
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoteForm userId={user.id} kind="comment" />
              <ul className="divide-y">
                {comments.map((c) => (
                  <li key={c.id} className="py-3">
                    <p className="text-sm">{c.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.staff?.name ?? "スタッフ"} ・ {formatDateTime(c.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                支援記録を書く
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NoteForm userId={user.id} kind="record" />
              <ul className="divide-y">
                {records.map((r) => (
                  <li key={r.id} className="py-3">
                    <p className="whitespace-pre-wrap text-sm">{r.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.staff?.name ?? "スタッフ"} ・ {formatDateTime(r.recordedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchanges">
          <Card>
            <CardContent className="pt-6">
              {exchanges.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">交換申請なし</p>
              ) : (
                <ul className="divide-y">
                  {exchanges.map((ex) => (
                    <li key={ex.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {ex.itemName}
                          <Badge
                            variant={
                              ex.status === "PENDING"
                                ? "destructive"
                                : ex.status === "DELIVERED"
                                  ? "success"
                                  : "secondary"
                            }
                            className="ml-2"
                          >
                            {ex.status === "PENDING"
                              ? "申請中"
                              : ex.status === "APPROVED"
                                ? "手配中"
                                : ex.status === "DELIVERED"
                                  ? "お渡し済み"
                                  : "キャンセル"}
                          </Badge>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(ex.createdAt)} ・ {ex.costLp.toLocaleString()} LP
                        </p>
                      </div>
                      <ExchangeStatusButtons exchangeId={ex.id} status={ex.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
