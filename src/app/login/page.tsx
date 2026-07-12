"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * ログインページ(Google OAuth のみ)
 */
function LoginContent() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");

  const signInWithGoogle = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="glass-panel w-full max-w-md animate-pop-in border-0">
        <CardHeader className="items-center text-center">
          <div className="animate-float mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-game-gradient shadow-lg shadow-sky-300/50 dark:shadow-sky-900/50">
            <Gamepad2 className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            <span className="text-game-gradient">GGH ライフポイント</span>
          </CardTitle>
          <CardDescription>
            Google アカウントでログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "inactive" && (
            <p className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
              このアカウントは現在利用できません。スタッフにお声がけください。
            </p>
          )}
          {error === "auth" && (
            <p className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
              ログインに失敗しました。もう一度お試しください。
            </p>
          )}
          <Button
            variant="game"
            size="lg"
            className="w-full"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            {/* Google ロゴ */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="currentColor"
                d="M21.35 11.1H12v2.9h5.4c-.25 1.4-1.02 2.6-2.17 3.4v2.8h3.5c2.05-1.9 3.22-4.7 3.22-8 0-.37-.03-.73-.1-1.1z"
              />
              <path
                fill="currentColor"
                d="M12 22c2.93 0 5.38-.97 7.17-2.63l-3.5-2.8c-.97.65-2.2 1.03-3.67 1.03-2.82 0-5.2-1.9-6.05-4.47H2.34v2.9C4.12 19.6 7.77 22 12 22z"
                opacity=".8"
              />
              <path
                fill="currentColor"
                d="M5.95 13.13A5.99 5.99 0 0 1 5.63 12c0-.4.06-.78.14-1.15V7.95H2.34A9.98 9.98 0 0 0 2 12c0 1.45.35 2.83.97 4.05l2.98-2.92z"
                opacity=".6"
              />
              <path
                fill="currentColor"
                d="M12 5.4c1.6 0 3.02.55 4.14 1.62l3.1-3.1C17.37 2.15 14.93 1 12 1 7.77 1 4.12 3.4 2.34 6.95l3.29 2.9C6.8 7.3 9.18 5.4 12 5.4z"
                opacity=".9"
              />
            </svg>
            {loading ? "リダイレクト中..." : "Google でログイン"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            初めての方もこのボタンからスタートできます
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
