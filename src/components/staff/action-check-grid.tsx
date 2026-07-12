"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { grantPoints } from "@/actions/points";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/icon";

interface ActionView {
  id: string;
  name: string;
  points: number;
  icon: string;
  category: string;
  /** 今日すでにチェック済みの回数 */
  todayCount: number;
}

/**
 * スタッフ用: 今日の行動チェックグリッド
 * タップすると即ポイントが自動加算される。
 */
export function ActionCheckGrid({
  userId,
  actions,
}: {
  userId: string;
  actions: ActionView[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCheck = (actionId: string) => {
    startTransition(async () => {
      await grantPoints(userId, actionId);
      router.refresh();
    });
  };

  // カテゴリごとにグループ化して表示
  const categories = Array.from(new Set(actions.map((a) => a.category)));

  return (
    <div className="space-y-5">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {cat}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {actions
              .filter((a) => a.category === cat)
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleCheck(a.id)}
                  disabled={isPending}
                  className={cn(
                    "group relative flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200 active:scale-95 disabled:opacity-60",
                    a.todayCount > 0
                      ? "border-emerald-300/60 bg-emerald-50/60 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                      : "hover:border-cyan-300/60 hover:shadow-md"
                  )}
                >
                  {a.todayCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 animate-pop-in items-center justify-center rounded-full bg-emerald-500 text-white">
                      {a.todayCount > 1 ? (
                        <span className="text-[10px] font-bold">{a.todayCount}</span>
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                    </span>
                  )}
                  {isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <DynamicIcon
                      name={a.icon}
                      className="h-6 w-6 text-primary transition-transform group-hover:scale-110"
                    />
                  )}
                  <span className="text-xs font-semibold leading-tight">{a.name}</span>
                  <span className="text-[10px] font-bold text-primary">+{a.points} LP</span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
