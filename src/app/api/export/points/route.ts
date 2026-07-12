import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * ポイント履歴 CSV 出力(スタッフ/管理者のみ)
 * GET /api/export/points?userId=xxx (省略時: 全利用者)
 */
export async function GET(request: Request) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "STAFF" && me.role !== "ADMIN")) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? undefined;

  const logs = await prisma.pointLog.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: { select: { name: true, email: true } },
      grantedBy: { select: { name: true } },
    },
  });

  // CSV エスケープ(カンマ・引用符・改行対応)
  const esc = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const header = ["日時", "利用者名", "メール", "内容", "ポイント", "確認スタッフ", "メモ"];
  const rows = logs.map((log) =>
    [
      new Date(log.createdAt).toLocaleString("ja-JP"),
      log.user.name,
      log.user.email,
      log.actionName,
      log.points,
      log.grantedBy?.name ?? "",
      log.note ?? "",
    ]
      .map(esc)
      .join(",")
  );

  // Excel での文字化け防止に BOM を付与
  const csv = "﻿" + [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="point_logs_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
