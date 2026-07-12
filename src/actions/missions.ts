"use server";

import { prisma } from "@/lib/prisma";
import { startOfToday, startOfWeek } from "@/lib/utils";

/**
 * 対象ユーザーの今日のデイリーミッションと今週のウィークリーミッションを
 * テンプレートから自動生成する(既にあればスキップ)。
 * ダッシュボード表示時に呼び出す「遅延生成」方式のため cron 不要。
 */
export async function ensureMissions(userId: string) {
  const today = startOfToday();
  const week = startOfWeek();

  const templates = await prisma.missionTemplate.findMany({
    where: { isActive: true },
  });

  for (const t of templates) {
    const periodStart = t.type === "DAILY" ? today : week;
    await prisma.userMission.upsert({
      where: {
        userId_templateId_periodStart: {
          userId,
          templateId: t.id,
          periodStart,
        },
      },
      update: {},
      create: {
        userId,
        templateId: t.id,
        type: t.type,
        periodStart,
        targetCount: t.targetCount,
      },
    });
  }
}
