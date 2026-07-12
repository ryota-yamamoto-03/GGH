"use client";

import { useState, useTransition } from "react";
import { toggleRankingVisibility } from "@/actions/profile";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * 「自分をランキングに表示する」トグル(本人設定)
 */
export function RankingToggle({ initial }: { initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="ranking-visible"
        checked={checked}
        disabled={isPending}
        onCheckedChange={(v) => {
          setChecked(v);
          startTransition(() => {
            void toggleRankingVisibility(v);
          });
        }}
      />
      <Label htmlFor="ranking-visible" className="text-xs text-muted-foreground">
        ランキングに表示
      </Label>
    </div>
  );
}
