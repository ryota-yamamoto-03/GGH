import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * セットアップ診断エンドポイント
 * GET /api/health
 *
 * 500 エラーの原因切り分け用に、以下を確認して JSON で返す(秘密情報は返さない):
 *  1. 環境変数が設定されているか
 *  2. データベースに接続できるか
 *  3. テーブルが作成済みか(db:push 済みか)
 *  4. 初期データが投入済みか(db:seed 済みか)
 */
export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
  };

  let supabaseUrlValid = false;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
      supabaseUrlValid = true;
    }
  } catch {
    supabaseUrlValid = false;
  }

  let database: { connected: boolean; tablesReady: boolean; seeded: boolean; error?: string } =
    { connected: false, tablesReady: false, seeded: false };

  try {
    await prisma.$queryRaw`SELECT 1`;
    database.connected = true;

    // users テーブルの存在確認(P2021 = テーブル未作成)
    const actionCount = await prisma.pointAction.count();
    database.tablesReady = true;
    database.seeded = actionCount > 0;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // 接続情報など秘密が混ざらないよう先頭のみ返す
    database.error = message.split("\n")[0].slice(0, 300);
  }

  const problems: string[] = [];
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    problems.push(
      "Supabase の環境変数が未設定です(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)。Vercel の場合は Settings → Environment Variables に設定して再デプロイしてください。"
    );
  } else if (!supabaseUrlValid) {
    problems.push(
      "NEXT_PUBLIC_SUPABASE_URL が URL 形式ではありません(例: https://xxxx.supabase.co)。"
    );
  }
  if (!env.DATABASE_URL) {
    problems.push("DATABASE_URL が未設定です。");
  } else if (!database.connected) {
    problems.push(
      "データベースに接続できません。DATABASE_URL のパスワード・ホスト・ポート(6543 + ?pgbouncer=true)を確認してください。"
    );
  } else if (!database.tablesReady) {
    problems.push(
      "テーブルが未作成です。ローカルから `npm run db:push` を実行してください。"
    );
  } else if (!database.seeded) {
    problems.push(
      "初期データが未投入です。`npm run db:seed` を実行してください(なくても起動はできますが、行動・商品が空になります)。"
    );
  }

  const ok = problems.length === 0;

  return NextResponse.json(
    {
      status: ok ? "ok" : "needs_setup",
      env: { ...env, supabaseUrlValid },
      database,
      problems,
      checkedAt: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 }
  );
}
