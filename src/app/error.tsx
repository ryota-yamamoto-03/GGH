"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * アプリ共通のエラー画面(500 の代わりに表示される)
 * サーバー側で例外が起きたとき、原因調査のヒントを表示する。
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vercel のログ(Functions)にも digest 付きで記録される
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="glass-panel w-full max-w-lg animate-pop-in p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-500/20">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>
        <h1 className="text-xl font-extrabold">サーバーでエラーが発生しました</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          少し時間をおいて再度お試しください。続く場合は管理者にお知らせください。
        </p>

        {error.digest && (
          <p className="mt-3 rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            エラーID: <code>{error.digest}</code>
          </p>
        )}

        {/* 管理者向けのセットアップチェックリスト */}
        <details className="mt-5 rounded-xl border bg-card p-4 text-left text-xs text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-foreground">
            管理者向け: よくある原因(セットアップ未完了)
          </summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-4">
            <li>
              環境変数の未設定/入力ミス —{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> /{" "}
              <code>DATABASE_URL</code> / <code>DIRECT_URL</code>
              (Vercel は設定変更後に再デプロイが必要)
            </li>
            <li>
              DB にテーブルが未作成 — <code>npm run db:push</code> と{" "}
              <code>npm run db:seed</code> を実行したか
            </li>
            <li>
              <code>DATABASE_URL</code> がプーラー接続(ポート6543 +{" "}
              <code>?pgbouncer=true</code>)になっているか
            </li>
            <li>
              診断ページ <code>/api/health</code>{" "}
              にアクセスすると、どこが失敗しているか確認できます
            </li>
          </ol>
        </details>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="game" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            再読み込み
          </Button>
          <Button variant="outline" asChild>
            <a href="/">トップへ戻る</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
