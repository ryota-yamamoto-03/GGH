"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";
import { setUserActive, updateUserRole } from "@/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AdminUserView {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  isActive: boolean;
}

/**
 * 管理者用: ユーザー / スタッフ / ロール管理
 */
export function UserRoleManager({
  users,
  myId,
}: {
  users: AdminUserView[];
  myId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <ul className="divide-y">
      {users.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={u.avatarUrl ?? undefined} alt={u.name} />
            <AvatarFallback className="text-xs">{u.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{u.name}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
          <Select
            value={u.role}
            disabled={isPending || u.id === myId}
            onValueChange={(role) =>
              startTransition(async () => {
                await updateUserRole(u.id, role as Role);
                router.refresh();
              })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER">利用者</SelectItem>
              <SelectItem value="STAFF">スタッフ</SelectItem>
              <SelectItem value="ADMIN">管理者</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Switch
              checked={u.isActive}
              disabled={isPending || u.id === myId}
              onCheckedChange={(v) =>
                startTransition(async () => {
                  await setUserActive(u.id, v);
                  router.refresh();
                })
              }
            />
            <span className="text-xs text-muted-foreground">有効</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
