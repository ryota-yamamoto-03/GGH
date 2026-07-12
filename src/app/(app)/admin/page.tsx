import { ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { PointActionManager } from "@/components/admin/point-action-manager";
import { RewardManager } from "@/components/admin/reward-manager";
import { MissionManager } from "@/components/admin/mission-manager";
import { AchievementManager } from "@/components/admin/achievement-manager";
import {
  AnnouncementManager,
  EventManager,
} from "@/components/admin/announcement-event-manager";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "管理者" };

/**
 * 管理者画面
 * ユーザー / ロール / ポイント設定 / 実績 / ミッション / 商品 / お知らせ / イベント / 設定
 */
export default async function AdminPage() {
  const admin = await requireRole("ADMIN");

  const [users, actions, rewards, missions, achievements, announcements, events, rankingSetting] =
    await Promise.all([
      prisma.user.findMany({ orderBy: [{ role: "desc" }, { name: "asc" }] }),
      prisma.pointAction.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.rewardItem.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { costLp: "asc" }],
      }),
      prisma.missionTemplate.findMany({
        where: { isActive: true },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.announcement.findMany({ orderBy: { publishedAt: "desc" }, take: 20 }),
      prisma.event.findMany({ orderBy: { startsAt: "desc" }, take: 20 }),
      prisma.appSetting.findUnique({ where: { key: "ranking_enabled" } }),
    ]);

  return (
    <div className="container space-y-6 py-6">
      <header className="animate-slide-up">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          管理者画面
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ポイント・実績・ミッション・商品などアプリ全体を管理します
        </p>
      </header>

      <Tabs defaultValue="users" className="animate-slide-up [animation-delay:100ms]">
        <div className="overflow-x-auto thin-scrollbar">
          <TabsList className="w-max">
            <TabsTrigger value="users">ユーザー管理</TabsTrigger>
            <TabsTrigger value="points">ポイント設定</TabsTrigger>
            <TabsTrigger value="achievements">実績</TabsTrigger>
            <TabsTrigger value="missions">ミッション</TabsTrigger>
            <TabsTrigger value="rewards">交換商品</TabsTrigger>
            <TabsTrigger value="announcements">お知らせ</TabsTrigger>
            <TabsTrigger value="events">イベント</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">利用者・スタッフ・ロール管理</CardTitle>
              <CardDescription>
                Google ログインしたユーザーが自動で「利用者」として追加されます。ここでロールを変更してください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleManager
                users={users.map((u) => ({
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  avatarUrl: u.avatarUrl,
                  role: u.role,
                  isActive: u.isActive,
                }))}
                myId={admin.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ポイント行動の設定</CardTitle>
              <CardDescription>行動の追加・ポイント数の変更・削除ができます</CardDescription>
            </CardHeader>
            <CardContent>
              <PointActionManager
                actions={actions.map((a) => ({
                  id: a.id,
                  name: a.name,
                  points: a.points,
                  icon: a.icon,
                  category: a.category,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">実績の設定</CardTitle>
              <CardDescription>
                実績の追加・編集と、手動付与(大会優勝など)ができます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementManager
                achievements={achievements.map((a) => ({
                  id: a.id,
                  code: a.code,
                  name: a.name,
                  description: a.description,
                  icon: a.icon,
                  bonusLp: a.bonusLp,
                }))}
                users={users
                  .filter((u) => u.role === "USER" && u.isActive)
                  .map((u) => ({ id: u.id, name: u.name }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ミッションの設定</CardTitle>
              <CardDescription>
                デイリーは毎日、ウィークリーは毎週月曜に全利用者へ自動生成されます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MissionManager
                missions={missions.map((m) => ({
                  id: m.id,
                  title: m.title,
                  type: m.type,
                  targetCount: m.targetCount,
                  rewardLp: m.rewardLp,
                  actionId: m.actionId,
                }))}
                actions={actions.map((a) => ({ id: a.id, name: a.name }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">交換商品の管理</CardTitle>
              <CardDescription>景品の追加・変更・削除ができます</CardDescription>
            </CardHeader>
            <CardContent>
              <RewardManager
                items={rewards.map((r) => ({
                  id: r.id,
                  name: r.name,
                  description: r.description,
                  costLp: r.costLp,
                  icon: r.icon,
                  stock: r.stock,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">お知らせ</CardTitle>
              <CardDescription>配信すると全利用者に通知が届きます</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementManager
                items={announcements.map((a) => ({
                  id: a.id,
                  title: a.title,
                  body: a.body,
                  publishedAt: a.publishedAt.toISOString(),
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">イベント管理</CardTitle>
              <CardDescription>
                ゲーム大会・交流イベントを登録すると全利用者に通知されます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventManager
                items={events.map((e) => ({
                  id: e.id,
                  title: e.title,
                  description: e.description,
                  location: e.location,
                  startsAt: e.startsAt.toISOString(),
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">アプリ設定</CardTitle>
            </CardHeader>
            <CardContent>
              <SettingsPanel rankingEnabled={rankingSetting?.value !== "false"} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
