"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, unlockAchievement } from "@/lib/auth";
import { calcLevel } from "@/lib/level";
import { startOfToday, startOfWeek } from "@/lib/utils";

/**
 * スタッフ/管理者が利用者の行動をチェックしてポイントを付与する。
 * - PointLog 作成 + LP 加算
 * - レベルアップ判定 → 通知
 * - ミッション進捗の自動更新
 * - 実績の自動判定(初外出 / 累計LP / 連続日数)
 */
export async function grantPoints(userId: string, actionId: string, note?: string) {
  const staff = await requireRole("STAFF", "ADMIN");

  const action = await prisma.pointAction.findUnique({ where: { id: actionId } });
  if (!action || !action.isActive) {
    return { ok: false as const, error: "この行動は現在利用できません" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "利用者が見つかりません" };

  const levelBefore = calcLevel(user.totalEarnedLp).level;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.pointLog.create({
      data: {
        userId,
        actionId: action.id,
        actionName: action.name,
        points: action.points,
        note,
        grantedById: staff.id,
      },
    });
    const u = await tx.user.update({
      where: { id: userId },
      data: {
        currentLp: { increment: action.points },
        totalEarnedLp: { increment: action.points },
      },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "POINT",
        title: `+${action.points} LP 獲得!`,
        body: `「${action.name}」でポイントを獲得しました`,
      },
    });
    return u;
  });

  // レベルアップ判定
  const levelAfter = calcLevel(updated.totalEarnedLp);
  if (levelAfter.level > levelBefore) {
    await prisma.notification.create({
      data: {
        userId,
        type: "LEVEL_UP",
        title: `レベルアップ! Lv${levelAfter.level} になりました`,
        body: `現在のランク: ${levelAfter.rank.name}`,
      },
    });
    if (levelAfter.level >= 10) {
      await unlockAchievement(userId, "LEVEL_10");
    }
  }

  // ミッション進捗の自動更新
  await progressMissions(userId, action.id);

  // 実績の自動判定
  await checkAutoAchievements(userId, action.name, updated.totalEarnedLp);

  revalidatePath("/staff");
  revalidatePath("/dashboard");
  return { ok: true as const, points: action.points };
}

/**
 * 誤付与の取り消し(スタッフ/管理者)。
 * ログを削除して LP を戻す。
 */
export async function revokePointLog(logId: string) {
  await requireRole("STAFF", "ADMIN");

  const log = await prisma.pointLog.findUnique({ where: { id: logId } });
  if (!log) return { ok: false as const, error: "履歴が見つかりません" };
  if (log.points <= 0) {
    return { ok: false as const, error: "交換履歴はここから取り消せません" };
  }

  await prisma.$transaction([
    prisma.pointLog.delete({ where: { id: logId } }),
    prisma.user.update({
      where: { id: log.userId },
      data: {
        currentLp: { decrement: log.points },
        totalEarnedLp: { decrement: log.points },
      },
    }),
  ]);

  revalidatePath("/staff");
  return { ok: true as const };
}

/**
 * ポイント付与に連動してデイリー/ウィークリーミッションの進捗を進める。
 * 達成時は報酬LPを付与し通知する。
 */
async function progressMissions(userId: string, actionId: string) {
  const today = startOfToday();
  const week = startOfWeek();

  const missions = await prisma.userMission.findMany({
    where: {
      userId,
      completed: false,
      template: { actionId },
      OR: [
        { type: "DAILY", periodStart: today },
        { type: "WEEKLY", periodStart: week },
      ],
    },
    include: { template: true },
  });

  for (const mission of missions) {
    const progress = mission.progress + 1;
    const isDone = progress >= mission.targetCount;

    await prisma.$transaction(async (tx) => {
      await tx.userMission.update({
        where: { id: mission.id },
        data: {
          progress,
          completed: isDone,
          completedAt: isDone ? new Date() : null,
        },
      });

      if (isDone && mission.template.rewardLp > 0) {
        await tx.user.update({
          where: { id: userId },
          data: {
            currentLp: { increment: mission.template.rewardLp },
            totalEarnedLp: { increment: mission.template.rewardLp },
          },
        });
        await tx.pointLog.create({
          data: {
            userId,
            actionName: `ミッション達成: ${mission.template.title}`,
            points: mission.template.rewardLp,
          },
        });
        await tx.notification.create({
          data: {
            userId,
            type: "MISSION",
            title: "ミッション達成!",
            body: `「${mission.template.title}」をクリアして +${mission.template.rewardLp} LP`,
          },
        });
      }
    });
  }
}

/**
 * 行動内容に応じた実績の自動判定。
 */
async function checkAutoAchievements(
  userId: string,
  actionName: string,
  totalEarnedLp: number
) {
  // 初外出
  if (actionName === "外出") {
    await unlockAchievement(userId, "FIRST_OUTING");
  }

  // 累計LP実績
  if (totalEarnedLp >= 100) await unlockAchievement(userId, "TOTAL_100_LP");
  if (totalEarnedLp >= 1000) await unlockAchievement(userId, "TOTAL_1000_LP");

  // 連続日数実績(服薬30日 / 起床100日)
  if (actionName === "服薬") {
    if (await hasStreak(userId, "服薬", 30)) {
      await unlockAchievement(userId, "MEDICINE_30_STREAK");
    }
  }
  if (actionName === "起床") {
    if (await hasStreak(userId, "起床", 100)) {
      await unlockAchievement(userId, "WAKEUP_100_STREAK");
    }
  }
}

/**
 * 今日から遡って `days` 日連続で該当行動のログがあるか判定する。
 */
async function hasStreak(userId: string, actionName: string, days: number) {
  const from = startOfToday();
  from.setDate(from.getDate() - (days - 1));

  const logs = await prisma.pointLog.findMany({
    where: { userId, actionName, createdAt: { gte: from } },
    select: { createdAt: true },
  });

  // 日付単位のセットにして連続性を確認
  const daySet = new Set(
    logs.map((l) => {
      const d = new Date(l.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  for (let i = 0; i < days; i++) {
    const d = startOfToday();
    d.setDate(d.getDate() - i);
    if (!daySet.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) {
      return false;
    }
  }
  return true;
}
