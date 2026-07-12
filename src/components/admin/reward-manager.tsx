"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deleteRewardItem, upsertRewardItem } from "@/actions/admin";
import { DynamicIcon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RewardView {
  id: string;
  name: string;
  description: string | null;
  costLp: number;
  icon: string;
  stock: number | null;
}

const emptyForm = {
  id: undefined as string | undefined,
  name: "",
  description: "",
  costLp: 500,
  icon: "gift",
  stock: "" as string, // 空 = 無制限
};

/**
 * 管理者用: 交換商品の追加・変更・削除
 */
export function RewardManager({ items }: { items: RewardView[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    if (!form.name.trim()) return;
    startTransition(async () => {
      await upsertRewardItem({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        costLp: form.costLp,
        icon: form.icon,
        stock: form.stock === "" ? null : Number(form.stock),
      });
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Button
        size="sm"
        onClick={() => {
          setForm(emptyForm);
          setOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        商品を追加
      </Button>

      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <DynamicIcon name={item.icon} className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.stock === null ? "在庫無制限" : `在庫 ${item.stock}`}
              </p>
            </div>
            <span className="font-bold tabular-nums text-primary">
              {item.costLp.toLocaleString()} LP
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="編集"
              onClick={() => {
                setForm({
                  id: item.id,
                  name: item.name,
                  description: item.description ?? "",
                  costLp: item.costLp,
                  icon: item.icon,
                  stock: item.stock === null ? "" : String(item.stock),
                });
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="削除"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteRewardItem(item.id);
                  router.refresh();
                })
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "商品を編集" : "商品を追加"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="rw-name">商品名</Label>
              <Input
                id="rw-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: お菓子セット"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rw-desc">説明</Label>
              <Input
                id="rw-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="rw-cost">必要LP</Label>
                <Input
                  id="rw-cost"
                  type="number"
                  min={0}
                  value={form.costLp}
                  onChange={(e) => setForm({ ...form, costLp: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rw-stock">在庫(空=無制限)</Label>
                <Input
                  id="rw-stock"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rw-icon">アイコン名</Label>
                <Input
                  id="rw-icon"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={save} disabled={isPending || !form.name.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
