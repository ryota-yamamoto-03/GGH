"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { MissionType } from "@prisma/client";
import { deleteMissionTemplate, upsertMissionTemplate } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MissionView {
  id: string;
  title: string;
  type: MissionType;
  targetCount: number;
  rewardLp: number;
  actionId: string | null;
}

interface ActionOption {
  id: string;
  name: string;
}

const emptyForm = {
  id: undefined as string | undefined,
  title: "",
  type: "DAILY" as MissionType,
  targetCount: 1,
  rewardLp: 10,
  actionId: "none",
};

/**
 * 管理者用: ミッションテンプレートの追加・変更・削除
 */
export function MissionManager({
  missions,
  actions,
}: {
  missions: MissionView[];
  actions: ActionOption[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    if (!form.title.trim()) return;
    startTransition(async () => {
      await upsertMissionTemplate({
        id: form.id,
        title: form.title.trim(),
        type: form.type,
        targetCount: form.targetCount,
        rewardLp: form.rewardLp,
        actionId: form.actionId === "none" ? null : form.actionId,
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
        ミッションを追加
      </Button>

      <ul className="divide-y">
        {missions.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-2.5">
            <Badge variant={m.type === "DAILY" ? "default" : "secondary"}>
              {m.type === "DAILY" ? "デイリー" : "ウィークリー"}
            </Badge>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{m.title}</p>
              <p className="text-xs text-muted-foreground">
                目標 {m.targetCount}回 ・ 報酬 +{m.rewardLp} LP
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="編集"
              onClick={() => {
                setForm({
                  id: m.id,
                  title: m.title,
                  type: m.type,
                  targetCount: m.targetCount,
                  rewardLp: m.rewardLp,
                  actionId: m.actionId ?? "none",
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
                  await deleteMissionTemplate(m.id);
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
            <DialogTitle>{form.id ? "ミッションを編集" : "ミッションを追加"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="ms-title">タイトル</Label>
              <Input
                id="ms-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="例: 外出する"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <Label>種類</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as MissionType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">デイリー</SelectItem>
                    <SelectItem value="WEEKLY">ウィークリー</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ms-target">目標回数</Label>
                <Input
                  id="ms-target"
                  type="number"
                  min={1}
                  value={form.targetCount}
                  onChange={(e) => setForm({ ...form, targetCount: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ms-reward">報酬LP</Label>
                <Input
                  id="ms-reward"
                  type="number"
                  min={0}
                  value={form.rewardLp}
                  onChange={(e) => setForm({ ...form, rewardLp: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>連動する行動(チェックで自動進捗)</Label>
              <Select
                value={form.actionId}
                onValueChange={(v) => setForm({ ...form, actionId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">連動なし</SelectItem>
                  {actions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={save} disabled={isPending || !form.title.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
