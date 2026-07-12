"use client";

import { icons, type LucideProps, Star } from "lucide-react";

/**
 * DB に保存された kebab-case のアイコン名(例: "shopping-cart")から
 * lucide-react アイコンを動的に描画する。
 * 不明な名前の場合は Star にフォールバックする。
 */
export function DynamicIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const pascal = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("") as keyof typeof icons;

  const Icon = icons[pascal] ?? Star;
  return <Icon {...props} />;
}
