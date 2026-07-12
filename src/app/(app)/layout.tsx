import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";

// DB へアクセスするため常に動的レンダリング
export const dynamic = "force-dynamic";

/**
 * ログイン後の全ページ共通レイアウト
 * サイドバー(PC)/ ボトムナビ(スマホ)+ ヘッダー
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <AppShell
      user={{
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      }}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
      }))}
    >
      {children}
    </AppShell>
  );
}
