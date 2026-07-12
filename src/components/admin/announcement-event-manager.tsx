"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, PartyPopper, Trash2 } from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  deleteEvent,
  upsertEvent,
} from "@/actions/admin";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AnnouncementView {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
}

interface EventView {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
}

/**
 * 管理者用: お知らせの配信(全利用者へ通知)
 */
export function AnnouncementManager({ items }: { items: AnnouncementView[] }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="grid gap-1.5">
          <Label htmlFor="an-title">タイトル</Label>
          <Input id="an-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="an-body">本文</Label>
          <Textarea id="an-body" value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isPending || !title.trim() || !body.trim()}
            onClick={() =>
              startTransition(async () => {
                await createAnnouncement(title.trim(), body.trim());
                setTitle("");
                setBody("");
                router.refresh();
              })
            }
          >
            <Megaphone className="h-4 w-4" />
            配信する
          </Button>
        </div>
      </div>

      <ul className="divide-y">
        {items.map((a) => (
          <li key={a.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{a.body}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {formatDateTime(a.publishedAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="削除"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteAnnouncement(a.id);
                  router.refresh();
                })
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 管理者用: イベント管理(登録時に全利用者へ通知)
 */
export function EventManager({ items }: { items: EventView[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="grid gap-1.5">
          <Label htmlFor="ev-title">イベント名</Label>
          <Input
            id="ev-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: スマブラ大会"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="ev-date">開始日時</Label>
            <Input
              id="ev-date"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ev-loc">場所</Label>
            <Input
              id="ev-loc"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="リビング"
            />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="ev-desc">説明</Label>
          <Textarea
            id="ev-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={isPending || !title.trim() || !startsAt}
            onClick={() =>
              startTransition(async () => {
                await upsertEvent({
                  title: title.trim(),
                  description: description.trim() || undefined,
                  location: location.trim() || undefined,
                  startsAt: new Date(startsAt),
                });
                setTitle("");
                setDescription("");
                setLocation("");
                setStartsAt("");
                router.refresh();
              })
            }
          >
            <PartyPopper className="h-4 w-4" />
            イベントを登録
          </Button>
        </div>
      </div>

      <ul className="divide-y">
        {items.map((ev) => (
          <li key={ev.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{ev.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(ev.startsAt)}
                {ev.location && ` @ ${ev.location}`}
              </p>
              {ev.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{ev.description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="削除"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await deleteEvent(ev.id);
                  router.refresh();
                })
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
