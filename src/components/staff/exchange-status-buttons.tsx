"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExchangeStatus } from "@prisma/client";
import { updateExchangeStatus } from "@/actions/rewards";
import { Button } from "@/components/ui/button";

/**
 * スタッフ用: 交換申請のステータス操作ボタン
 */
export function ExchangeStatusButtons({
  exchangeId,
  status,
}: {
  exchangeId: string;
  status: ExchangeStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const update = (next: ExchangeStatus) => {
    startTransition(async () => {
      await updateExchangeStatus(exchangeId, next);
      router.refresh();
    });
  };

  if (status === "DELIVERED" || status === "CANCELED") return null;

  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <Button size="sm" variant="outline" disabled={isPending} onClick={() => update("APPROVED")}>
          承認
        </Button>
      )}
      <Button size="sm" variant="game" disabled={isPending} onClick={() => update("DELIVERED")}>
        お渡し完了
      </Button>
      <Button size="sm" variant="ghost" disabled={isPending} onClick={() => update("CANCELED")}>
        キャンセル
      </Button>
    </div>
  );
}
