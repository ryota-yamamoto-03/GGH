"use server";

import { revalidatePath } from "next/cache";
import type { MissionType, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, unlockAchievement } from "@/lib/auth";

/** 管理画面配下のパスをまとめて再検証 */
function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/shop");
}

// ============================================================
// ポイント行動マスタ
// ============================================================

export async function upsertPointAction(data: {
  id?: string;
  name: string;
  points: number;
  icon?: string;
  category?: string;
  isActive?: boolean;
}) {
  await requireRole("ADMIN");
  const { id, ...rest } = data;
  if (id) {
    await prisma.pointAction.update({ where: { id }, data: rest });
  } else {
    await prisma.pointAction.create({ data: rest });
  }
  revalidateAdmin();
  return { ok: true as const };
}

export async function deletePointAction(id: string) {
  await requireRole("ADMIN");
  // 履歴を保全するため物理削除ではなく無効化
  await prisma.pointAction.update({ where: { id }, data: { isActive: false } });
  revalidateAdmin();
  return { ok: true as const };
}

// ============================================================
// 交換商品
// ============================================================

export async function upsertRewardItem(data: {
  id?: string;
  name: string;
  description?: string;
  costLp: number;
  icon?: string;
  stock?: number | null;
  isActive?: boolean;
}) {
  await requireRole("ADMIN");
  const { id, ...rest } = data;
  if (id) {
    await prisma.rewardItem.update({ where: { id }, data: rest });
  } else {
    await prisma.rewardItem.create({ data: rest });
  }
  revalidateAdmin();
  return { ok: true as const };
}

export async function deleteRewardItem(id: string) {
  await requireRole("ADMIN");
  await prisma.rewardItem.update({ where: { id }, data: { isActive: false } });
  revalidateAdmin();
  return { ok: true as const };
}

// ============================================================
// ミッションテンプレート
// ============================================================

export async function upsertMissionTemplate(data: {
  id?: string;
  title: string;
  description?: string;
  type: MissionType;
  targetCount: number;
  rewardLp: number;
  actionId?: string | null;
  isActive?: boolean;
}) {
  await requireRole("ADMIN");
  const { id, ...rest } = data;
  if (id) {
    await prisma.missionTemplate.update({ where: { id }, data: rest });
  } else {
    await prisma.missionTemplate.create({ data: rest });
  }
  revalidateAdmin();
  return { ok: true as const };
}

export async function deleteMissionTemplate(id: string) {
  await requireRole("ADMIN");
  await prisma.missionTemplate.update({ where: { id }, data: { isActive: false } });
  revalidateAdmin();
  return { ok: true as const };
}

// ============================================================
// 実績
// ============================================================

export async function upsertAchievement(data: {
  id?: string;
  code: string;
  name: string;
  description: string;
  icon?: string;
  bonusLp?: number;
  isSecret?: boolean;
  isActive?: boolean;
}) {
  await requireRole("ADMIN");
  const { id, ...rest } = data;
  if (id) {
    await prisma.achievement.update({ where: { id }, data: rest });
  } else {
    await prisma.achievement.create({ data: rest });
  }
  revalidateAdmin();
  return { ok: true as const };
}

/** 手動で実績を付与する(ゲーム大会優勝・初就労・初料理など) */
export async function grantAchievementManually(userId: string, code: string) {
  await requireRole("STAFF", "ADMIN");
  const result = await unlockAchievement(userId, code);
  revalidateAdmin();
  return result
    ? { ok: true as const }
    : { ok: false as const, error: "既に解除済みか、実績が存在しません" };
}

// ============================================================
// ユーザー / ロール管理
// ============================================================

export async function updateUserRole(userId: string, role: Role) {
  const admin = await requireRole("ADMIN");
  if (admin.id === userId && role !== "ADMIN") {
    return { ok: false as const, error: "自分自身の管理者権限は外せません" };
  }
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidateAdmin();
  return { ok: true as const };
}

export async function setUserActive(userId: string, isActive: boolean) {
  await requireRole("ADMIN");
  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  revalidateAdmin();
  return { ok: true as const };
}

// ============================================================
// お知らせ / イベント
// ============================================================

export async function createAnnouncement(title: string, body: string) {
  await requireRole("ADMIN");
  await prisma.announcement.create({ data: { title, body } });

  // 全アクティブ利用者に通知
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  await prisma.notification.createMany({
    data: users.map((u) => ({
      userId: u.id,
      type: "ANNOUNCEMENT" as const,
      title: `お知らせ: ${title}`,
      body,
    })),
  });

  revalidateAdmin();
  return { ok: true as const };
}

export async function deleteAnnouncement(id: string) {
  await requireRole("ADMIN");
  await prisma.announcement.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true as const };
}

export async function upsertEvent(data: {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: Date;
  endsAt?: Date | null;
}) {
  await requireRole("ADMIN");
  const { id, ...rest } = data;
  if (id) {
    await prisma.event.update({ where: { id }, data: rest });
  } else {
    await prisma.event.create({ data: rest });
    // イベント開始の通知
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: "EVENT" as const,
        title: `イベント: ${rest.title}`,
        body: rest.description ?? "",
      })),
    });
  }
  revalidateAdmin();
  return { ok: true as const };
}

export async function deleteEvent(id: string) {
  await requireRole("ADMIN");
  await prisma.event.delete({ where: { id } });
  revalidateAdmin();
  return { ok: true as const };
}

// ============================================================
// アプリ設定(ランキングON/OFFなど)
// ============================================================

export async function setAppSetting(key: string, value: string) {
  await requireRole("ADMIN");
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidateAdmin();
  revalidatePath("/ranking");
  return { ok: true as const };
}

// ============================================================
// スタッフ用: コメント / 支援記録
// ============================================================

export async function addStaffComment(userId: string, body: string) {
  const staff = await requireRole("STAFF", "ADMIN");
  await prisma.staffComment.create({
    data: { userId, staffId: staff.id, body },
  });
  revalidatePath(`/staff/users/${userId}`);
  return { ok: true as const };
}

export async function addSupportRecord(userId: string, content: string) {
  const staff = await requireRole("STAFF", "ADMIN");
  await prisma.supportRecord.create({
    data: { userId, staffId: staff.id, content },
  });
  revalidatePath(`/staff/users/${userId}`);
  return { ok: true as const };
}
