import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラス結合ユーティリティ(shadcn/ui 標準) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 日付を「2026/07/12 14:30」形式に整形 */
export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 日付を「7/12(土)」形式に整形 */
export function formatDateShort(date: Date | string) {
  return new Date(date).toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
}

/** ポイントを「1,234 LP」形式に整形 */
export function formatLp(points: number) {
  return `${points.toLocaleString("ja-JP")} LP`;
}

/** その日の 00:00(ローカル)を返す */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** その週の月曜 00:00(ローカル)を返す */
export function startOfWeek(base = new Date()): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const day = d.getDay(); // 0=日, 1=月...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
