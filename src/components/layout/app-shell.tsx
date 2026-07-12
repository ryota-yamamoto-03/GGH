"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChartLine,
  Gamepad2,
  Gift,
  History,
  Home,
  LogOut,
  Medal,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDateTime } from "@/lib/utils";
import { markNotificationsRead } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

interface ShellUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
}

interface ShellNotification {
  id: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

/** ロール別ナビゲーション定義 */
const navItems = [
  { href: "/dashboard", label: "ホーム", icon: Home },
  { href: "/missions", label: "ミッション", icon: Target },
  { href: "/achievements", label: "実績", icon: Trophy },
  { href: "/shop", label: "交換所", icon: Gift },
  { href: "/ranking", label: "ランキング", icon: Medal },
  { href: "/analytics", label: "分析", icon: ChartLine },
  { href: "/history", label: "履歴", icon: History },
];

const staffItems = [{ href: "/staff", label: "スタッフ", icon: Users }];
const adminItems = [{ href: "/admin", label: "管理者", icon: ShieldCheck }];

export function AppShell({
  user,
  notifications,
  children,
}: {
  user: ShellUser;
  notifications: ShellNotification[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const items = [
    ...navItems,
    ...(user.role === "STAFF" || user.role === "ADMIN" ? staffItems : []),
    ...(user.role === "ADMIN" ? adminItems : []),
  ];

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // モバイルのボトムナビは主要5項目に絞る
  const mobileItems = items.filter((i) =>
    ["/dashboard", "/missions", "/shop", "/staff", "/admin", "/achievements"].includes(i.href)
  ).slice(0, 5);

  return (
    <div className="flex min-h-dvh bg-background">
      {/* ---------- サイドバー(PC / タブレット横) ---------- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-card/60 backdrop-blur-md lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-game-gradient shadow-md">
            <Gamepad2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-game-gradient">GGH</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-game-gradient text-white shadow-md shadow-sky-300/40 dark:shadow-sky-900/40"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.role === "ADMIN" ? "管理者" : user.role === "STAFF" ? "スタッフ" : "利用者"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="ログアウト">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* ---------- メイン ---------- */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        {/* ヘッダー */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-game-gradient">
              <Gamepad2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-game-gradient">GGH</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            {/* 通知ベル */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="通知">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 animate-pop-in items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  通知
                  {unreadCount > 0 && (
                    <button
                      className="text-xs font-normal text-primary hover:underline"
                      onClick={async () => {
                        await markNotificationsRead();
                        router.refresh();
                      }}
                    >
                      すべて既読
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto thin-scrollbar">
                  {notifications.length === 0 && (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      通知はまだありません
                    </p>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "border-b px-3 py-2.5 text-sm last:border-0",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <p className="font-medium">{n.title}</p>
                      {n.body && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatDateTime(n.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {/* モバイル用ユーザーメニュー */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <button aria-label="ユーザーメニュー">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ページ本体 */}
        <main className="flex-1 pb-20 lg:pb-6">{children}</main>
      </div>

      {/* ---------- ボトムナビ(スマホ / タブレット縦) ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t bg-background/90 backdrop-blur-md lg:hidden">
        {mobileItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "animate-pop-in")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
