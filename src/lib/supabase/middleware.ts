import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Supabase の環境変数が正しく設定されているか確認する。
 * 未設定・URL形式不正のまま createServerClient を呼ぶと例外になり、
 * middleware は全ルートで動くため「全ページ 500」になってしまう。
 */
function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    new URL(url); // "https://xxx.supabase.co" の形式かを検証
  } catch {
    return null;
  }
  return { url, anonKey };
}

/**
 * middleware 用: Supabase セッションの更新とログインガード
 * - 未ログインで保護ページへアクセス → /login にリダイレクト
 * - ログイン済みで /login へアクセス → /dashboard にリダイレクト
 * - 設定不備や Supabase 障害時は 500 にせず素通しする
 *   (各ページ側の requireUser が /login へ誘導するため安全)
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = getSupabaseEnv();
  if (!env) {
    // 環境変数が未設定でもサイト全体を落とさない。
    // /api/health で状態を確認できる。
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定または不正です。" +
        " Vercel の環境変数設定(または .env)を確認してください。"
    );
    return response;
  }

  try {
    const supabase = createServerClient(env.url, env.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // getUser() はトークンを検証するため getSession() より安全
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;
    const isPublic =
      path === "/" ||
      path.startsWith("/login") ||
      path.startsWith("/auth") ||
      path.startsWith("/api/health") ||
      path.startsWith("/_next") ||
      path.startsWith("/favicon");

    if (!user && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    if (user && path === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  } catch (e) {
    // Supabase への一時的な接続失敗などで全ページを 500 にしない
    console.error("[middleware] セッション更新に失敗しました:", e);
    return response;
  }
}
