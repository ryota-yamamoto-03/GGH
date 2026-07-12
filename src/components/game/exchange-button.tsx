"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { exchangeReward } from "@/actions/rewards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * ショップの「交換する」ボタン。
 * 確認ダイアログ → 交換実行 → 完了アニメーション表示。
 */
export function ExchangeButton({
  itemId,
  itemName,
  costLp,
  affordable,
  inStock,
}: {
  itemId: string;
  itemName: string;
  costLp: number;
  affordable: boolean;
  inStock: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleExchange = () => {
    startTransition(async () => {
      const result = await exchangeReward(itemId);
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setDone(false);
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={affordable && inStock ? "game" : "secondary"}
          size="sm"
          className="w-full"
          disabled={!affordable || !inStock}
        >
          {!inStock ? "在庫切れ" : affordable ? "交換する" : "LPが足りません"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="animate-pop-in flex h-16 w-16 items-center justify-center rounded-full bg-game-gradient shadow-lg">
              <PartyPopper className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="animate-slide-up">交換申請が完了しました!</DialogTitle>
            <DialogDescription className="animate-slide-up">
              スタッフが確認して「{itemName}」をお渡しします
            </DialogDescription>
            <Button variant="game" onClick={() => setOpen(false)}>
              とじる
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>「{itemName}」と交換しますか?</DialogTitle>
              <DialogDescription>
                {costLp.toLocaleString()} LP を消費します。この操作の取り消しはスタッフに依頼できます。
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                キャンセル
              </Button>
              <Button variant="game" onClick={handleExchange} disabled={isPending}>
                {isPending ? "交換中..." : "交換する"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
