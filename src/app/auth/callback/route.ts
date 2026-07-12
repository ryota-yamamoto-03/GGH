import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Google OAuth コールバック
 * 認可コードをセッションに交換してアプリへリダイレクトする。
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  try {
    if (code) {
      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // オープンリダイレクト防止のため同一オリジンのパスのみ許可
        const safeNext = next.startsWith("/") ? next : "/dashboard";
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    }
  } catch (e) {
    // 設定不備などで例外が起きても 500 にせずログイン画面へ戻す
    console.error("[auth/callback] セッション交換に失敗しました:", e);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
