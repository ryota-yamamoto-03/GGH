import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * 現在ログイン中のユーザー(DBレコード)を取得する。
 * 初回ログイン時は Supabase Auth の情報から User レコードを自動作成し、
 * 「初ログイン」実績を解除する。
 * React cache() で同一リクエスト内の重複クエリを防ぐ。
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  // Supabase の環境変数が未設定の場合はログイン不可として扱う
  // (500 にせず /login へ誘導する。診断は /api/health で可能)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      "[auth] Supabase の環境変数が未設定です。/api/health で状態を確認してください。"
    );
    return null;
  }

  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  let user = await prisma.user.findUnique({ where: { id: authUser.id } });

  if (!user) {
    // 初回ログイン: Google プロフィールからユーザーを作成
    user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email ?? "",
        name:
          (authUser.user_metadata?.full_name as string) ??
          (authUser.user_metadata?.name as string) ??
          authUser.email?.split("@")[0] ??
          "冒険者",
        avatarUrl: (authUser.user_metadata?.avatar_url as string) ?? null,
      },
    });

    // 「初ログイン」実績を解除
    await unlockAchievement(user.id, "FIRST_LOGIN");
  }

  return user;
});

/**
 * ログイン必須ページ用。未ログインなら /login へ。
 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isActive) redirect("/login?error=inactive");
  return user;
}

/**
 * ロール制限付きページ用。権限が無ければ /dashboard へ。
 * ADMIN は STAFF 権限も包含する。
 */
export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  const allowed =
    roles.includes(user.role) ||
    (user.role === "ADMIN" && roles.includes("STAFF"));
  if (!allowed) redirect("/dashboard");
  return user;
}

/**
 * 実績を解除する(既に解除済みなら何もしない)。
 * ボーナスLPの付与と通知作成もここで行う。
 */
export async function unlockAchievement(userId: string, code: string) {
  const achievement = await prisma.achievement.findUnique({ where: { code } });
  if (!achievement || !achievement.isActive) return null;

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return null;

  await prisma.$transaction(async (tx) => {
    await tx.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });

    if (achievement.bonusLp > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          currentLp: { increment: achievement.bonusLp },
          totalEarnedLp: { increment: achievement.bonusLp },
        },
      });
      await tx.pointLog.create({
        data: {
          userId,
          actionName: `実績ボーナス: ${achievement.name}`,
          points: achievement.bonusLp,
        },
      });
    }

    await tx.notification.create({
      data: {
        userId,
        type: "ACHIEVEMENT",
        title: `実績解除!「${achievement.name}」`,
        body: achievement.description,
      },
    });
  });

  return achievement;
}
