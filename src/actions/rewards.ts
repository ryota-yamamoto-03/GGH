"use server";

import { revalidatePath } from "next/cache";
import type { ExchangeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, requireUser, unlockAchievement } from "@/lib/auth";

/**
 * 利用者本人がポイントを景品に交換する。
 * - 所持LPチェック / 在庫チェック
 * - 交換履歴(PENDING)を作成し、LP を減算
 * - PointLog にマイナスとして記録
 */
export async function exchangeReward(itemId: string) {
  const user = await requireUser();

  const item = await prisma.rewardItem.findUnique({ where: { id: itemId } });
  if (!item || !item.isActive) {
    return { ok: false as const, error: "この商品は現在交換できません" };
  }
  if (user.currentLp < item.costLp) {
    return { ok: false as const, error: "ポイントが足りません" };
  }
  if (item.stock !== null && item.stock <= 0) {
    return { ok: false as const, error: "在庫切れです" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.rewardExchange.create({
      data: {
        userId: user.id,
        itemId: item.id,
        itemName: item.name,
        costLp: item.costLp,
      },
    });
    await tx.user.update({
      where: { id: user.id },
      data: { currentLp: { decrement: item.costLp } },
    });
    if (item.stock !== null) {
      await tx.rewardItem.update({
        where: { id: item.id },
        data: { stock: { decrement: 1 } },
      });
    }
    await tx.pointLog.create({
      data: {
        userId: user.id,
        actionName: `交換: ${item.name}`,
        points: -item.costLp,
      },
    });
    await tx.notification.create({
      data: {
        userId: user.id,
        type: "EXCHANGE",
        title: "交換申請を受け付けました",
        body: `「${item.name}」(${item.costLp} LP)。スタッフが確認します。`,
      },
    });
  });

  await unlockAchievement(user.id, "FIRST_EXCHANGE");

  revalidatePath("/shop");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

/**
 * スタッフ/管理者が交換申請のステータスを更新する。
 * キャンセル時はポイントと在庫を返却する。
 */
export async function updateExchangeStatus(exchangeId: string, status: ExchangeStatus) {
  await requireRole("STAFF", "ADMIN");

  const exchange = await prisma.rewardExchange.findUnique({
    where: { id: exchangeId },
  });
  if (!exchange) return { ok: false as const, error: "申請が見つかりません" };
  if (exchange.status === "CANCELED") {
    return { ok: false as const, error: "キャンセル済みの申請です" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.rewardExchange.update({
      where: { id: exchangeId },
      data: { status },
    });

    if (status === "CANCELED") {
      // ポイント返却
      await tx.user.update({
        where: { id: exchange.userId },
        data: { currentLp: { increment: exchange.costLp } },
      });
      await tx.pointLog.create({
        data: {
          userId: exchange.userId,
          actionName: `交換キャンセル返却: ${exchange.itemName}`,
          points: exchange.costLp,
        },
      });
      // 在庫返却
      if (exchange.itemId) {
        const item = await tx.rewardItem.findUnique({ where: { id: exchange.itemId } });
        if (item && item.stock !== null) {
          await tx.rewardItem.update({
            where: { id: exchange.itemId },
            data: { stock: { increment: 1 } },
          });
        }
      }
    }

    if (status === "DELIVERED") {
      await tx.notification.create({
        data: {
          userId: exchange.userId,
          type: "EXCHANGE",
          title: "景品交換が完了しました🎁",
          body: `「${exchange.itemName}」をお渡ししました`,
        },
      });
    }
  });

  revalidatePath("/staff");
  revalidatePath("/admin");
  return { ok: true as const };
}
