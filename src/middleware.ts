import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * すべてのリクエストで Supabase セッションを更新し、
 * 未ログインユーザーを /login へ誘導する。
 * ロール別のアクセス制御はサーバー側(requireRole)で行う。
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 静的ファイルと画像最適化を除くすべてのパスに適用
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
