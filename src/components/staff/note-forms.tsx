"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addStaffComment, addSupportRecord } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * スタッフ用: コメント / 支援記録の入力フォーム
 */
export function NoteForm({
  userId,
  kind,
}: {
  userId: string;
  kind: "comment" | "record";
}) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const submit = () => {
    if (!value.trim()) return;
    startTransition(async () => {
      if (kind === "comment") {
        await addStaffComment(userId, value.trim());
      } else {
        await addSupportRecord(userId, value.trim());
      }
      setValue("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          kind === "comment"
            ? "利用者へのコメント・応援メッセージ"
            : "支援記録(様子・対応内容など)"
        }
        rows={3}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={submit} disabled={isPending || !value.trim()}>
          {isPending ? "保存中..." : "保存"}
        </Button>
      </div>
    </div>
  );
}
