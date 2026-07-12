# Vercel デプロイ手順

## 1. リポジトリを GitHub に push

このリポジトリを GitHub に置きます(既にある場合はスキップ)。

## 2. Vercel プロジェクト作成

1. https://vercel.com → **Add New → Project**
2. GitHub リポジトリ `GGH` をインポート
3. Framework Preset: **Next.js**(自動検出)
4. Build Command はデフォルトのまま
   (`package.json` の `build` に `prisma generate` を含めてあります)

## 3. 環境変数の設定

**Settings → Environment Variables** に `.env` と同じ値を設定:

| Key | 備考 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon キー |
| `DATABASE_URL` | Transaction pooler(`?pgbouncer=true` 付き) |
| `DIRECT_URL` | Direct connection |
| `NEXT_PUBLIC_APP_URL` | `https://<本番ドメイン>` |

## 4. Supabase 側の URL 設定を更新

Supabase **Authentication → URL Configuration**:

- Site URL: `https://<本番ドメイン>`
- Redirect URLs に `https://<本番ドメイン>/auth/callback` を追加

Google Cloud Console 側のリダイレクト URI は
`https://<プロジェクトID>.supabase.co/auth/v1/callback` のままで変更不要です。

## 5. デプロイ

**Deploy** をクリック。以降は `main` ブランチへの push で自動デプロイされます。

## 6. デプロイ後チェックリスト

- [ ] 本番 URL で Google ログインできる
- [ ] 管理者アカウントを SQL でロール昇格済み([SETUP.md](./SETUP.md) 手順8)
- [ ] `/admin` でポイント・商品マスタが表示される(シード投入済み)
- [ ] スタッフ画面から行動チェック → ポイント加算が動く
- [ ] ダークモード・スマホ表示を確認

## 補足: ミッションの自動生成について

デイリー/ウィークリーミッションは「ユーザーがダッシュボードを開いたとき」に
その日・その週の分を遅延生成するため、**cron 設定なしで動作**します。

将来的に厳密な深夜バッチ(通知の一斉配信など)が必要になった場合は、
[Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) で
`/api/cron/daily` のような Route Handler を叩く構成に拡張してください。
