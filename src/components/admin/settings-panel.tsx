"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAppSetting } from "@/actions/admin";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

/**
 * 管理者用: アプリ全体設定(ランキングON/OFFなど)
 */
export function SettingsPanel({ rankingEnabled }: { rankingEnabled: boolean }) {
  const [ranking, setRanking] = useState(rankingEnabled);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <Label htmlFor="setting-ranking" className="text-sm font-semibold">
            ランキング機能
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            OFFにすると全利用者のランキング表示が非表示になります
          </p>
        </div>
        <Switch
          id="setting-ranking"
          checked={ranking}
          disabled={isPending}
          onCheckedChange={(v) => {
            setRanking(v);
            startTransition(async () => {
              await setAppSetting("ranking_enabled", v ? "true" : "false");
              router.refresh();
            });
          }}
        />
      </div>
    </div>
  );
}
