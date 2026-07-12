"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

/**
 * 自分をランキングに表示するかどうかを切り替える(本人のみ)。
 */
export async function toggleRankingVisibility(show: boolean) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { showInRanking: show },
  });
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  return { ok: true as const };
}

/**
 * 自分の通知をすべて既読にする。
 */
export async function markNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
  return { ok: true as const };
}
