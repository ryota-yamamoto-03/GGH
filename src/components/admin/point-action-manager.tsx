"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { deletePointAction, upsertPointAction } from "@/actions/admin";
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

interface ActionView {
  id: string;
  name: string;
  points: number;
  icon: string;
  category: string;
}

const emptyForm = { id: undefined as string | undefined, name: "", points: 10, icon: "star", category: "生活" };

/**
 * 管理者用: ポイント行動マスタの追加・変更・削除
 */
export function PointActionManager({ actions }: { actions: ActionView[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    if (!form.name.trim()) return;
    startTransition(async () => {
      await upsertPointAction({
        id: form.id,
        name: form.name.trim(),
        points: form.points,
        icon: form.icon,
        category: form.category,
      });
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await deletePointAction(id);
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
        行動を追加
      </Button>

      <ul className="divide-y">
        {actions.map((a) => (
          <li key={a.id} className="flex items-center gap-3 py-2.5">
            <DynamicIcon name={a.icon} className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.category}</p>
            </div>
            <span className="font-bold tabular-nums text-primary">+{a.points} LP</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="編集"
              onClick={() => {
                setForm({ id: a.id, name: a.name, points: a.points, icon: a.icon, category: a.category });
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
              onClick={() => remove(a.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "行動を編集" : "行動を追加"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="pa-name">行動名</Label>
              <Input
                id="pa-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: 起床"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="pa-points">ポイント</Label>
                <Input
                  id="pa-points"
                  type="number"
                  min={0}
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pa-category">カテゴリ</Label>
                <Input
                  id="pa-category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="生活 / 健康 / 活動 など"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pa-icon">アイコン名(lucide)</Label>
              <Input
                id="pa-icon"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="例: sunrise, pill, dumbbell"
              />
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
