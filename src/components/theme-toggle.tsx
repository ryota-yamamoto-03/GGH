"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** ライト/ダーク切替ボタン */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // SSR とのハイドレーション差異を避ける
  React.useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <Button variant="ghost" size="icon" aria-label="テーマ切替" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="テーマ切替"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
