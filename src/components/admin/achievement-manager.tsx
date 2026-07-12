"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, Pencil, Plus } from "lucide-react";
import { grantAchievementManually, upsertAchievement } from "@/actions/admin";
import { DynamicIcon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface AchievementView {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  bonusLp: number;
}

interface UserOption {
  id: string;
  name: string;
}

const emptyForm = {
  id: undefined as string | undefined,
  code: "",
  name: "",
  description: "",
  icon: "trophy",
  bonusLp: 10,
};

/**
 * 管理者用: 実績の追加・編集と手動付与
 * (ゲーム大会優勝・初就労・初料理などは手動付与で運用)
 */
export function AchievementManager({
  achievements,
  users,
}: {
  achievements: AchievementView[];
  users: UserOption[];
}) {
  const [open, setOpen] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantCode, setGrantCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const save = () => {
    if (!form.code.trim() || !form.name.trim()) return;
    startTransition(async () => {
      await upsertAchievement({
        id: form.id,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        bonusLp: form.bonusLp,
      });
      setOpen(false);
      setForm(emptyForm);
      router.refresh();
    });
  };

  const grant = () => {
    if (!grantUserId || !grantCode) return;
    startTransition(async () => {
      const result = await grantAchievementManually(grantUserId, grantCode);
      setMessage(result.ok ? "実績を付与しました🎉" : result.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            setForm(emptyForm);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          実績を追加
        </Button>
        <Button size="sm" variant="outline" onClick={() => setGrantOpen(true)}>
          <Award className="h-4 w-4" />
          手動で付与
        </Button>
      </div>

      <ul className="divide-y">
        {achievements.map((a) => (
          <li key={a.id} className="flex items-center gap-3 py-2.5">
            <DynamicIcon name={a.icon} className="h-5 w-5 shrink-0 text-yellow-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{a.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {a.code} ・ {a.description}
              </p>
            </div>
            {a.bonusLp > 0 && (
              <span className="text-xs font-bold text-primary">+{a.bonusLp} LP</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="編集"
              onClick={() => {
                setForm({
                  id: a.id,
                  code: a.code,
                  name: a.name,
                  description: a.description,
                  icon: a.icon,
                  bonusLp: a.bonusLp,
                });
                setOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>

      {/* 追加・編集ダイアログ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.id ? "実績を編集" : "実績を追加"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="ac-code">コード(英大文字)</Label>
                <Input
                  id="ac-code"
                  value={form.code}
                  disabled={Boolean(form.id)}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="FIRST_COOKING"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ac-name">実績名</Label>
                <Input
                  id="ac-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="見習いシェフ"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ac-desc">説明</Label>
              <Input
                id="ac-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="ac-bonus">ボーナスLP</Label>
                <Input
                  id="ac-bonus"
                  type="number"
                  min={0}
                  value={form.bonusLp}
                  onChange={(e) => setForm({ ...form, bonusLp: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="ac-icon">アイコン名</Label>
                <Input
                  id="ac-icon"
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
            <Button onClick={save} disabled={isPending}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 手動付与ダイアログ */}
      <Dialog
        open={grantOpen}
        onOpenChange={(v) => {
          setGrantOpen(v);
          if (!v) setMessage(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>実績を手動で付与</DialogTitle>
            <DialogDescription>
              ゲーム大会優勝・初就労・初料理などはここから付与します
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>利用者</Label>
              <Select value={grantUserId} onValueChange={setGrantUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="利用者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>実績</Label>
              <Select value={grantCode} onValueChange={setGrantCode}>
                <SelectTrigger>
                  <SelectValue placeholder="実績を選択" />
                </SelectTrigger>
                <SelectContent>
                  {achievements.map((a) => (
                    <SelectItem key={a.code} value={a.code}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {message && <p className="text-sm text-primary">{message}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)}>
              閉じる
            </Button>
            <Button onClick={grant} disabled={isPending || !grantUserId || !grantCode}>
              付与する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
