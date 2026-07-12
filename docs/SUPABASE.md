# Supabase セットアップ手順(詳細)

## 1. プロジェクト作成

1. https://supabase.com にサインイン
2. **New project** をクリック
   - Name: `ggh-life-point`(任意)
   - Database Password: 強力なパスワードを生成して保管
   - Region: `Northeast Asia (Tokyo)` 推奨
3. 作成完了まで数分待つ

## 2. API キーの取得

**Settings → API** から:

| 項目 | 環境変数 |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

> `service_role` キーは本アプリでは使用しません。誤ってクライアントに公開しないよう注意してください。

## 3. データベース接続文字列(Prisma 用)

**Settings → Database → Connection string** から:

- **Transaction pooler**(ポート `6543`)→ `DATABASE_URL`
  - 末尾に `?pgbouncer=true` を付ける
- **Direct connection / Session pooler**(ポート `5432`)→ `DIRECT_URL`

```
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

> Vercel などサーバーレス環境では接続数が増えやすいため、
> アプリの実行は必ず Transaction pooler 経由(`DATABASE_URL`)にします。
> `DIRECT_URL` は `prisma db push` / `migrate` 専用です。

## 4. Google 認証プロバイダの有効化

1. **Authentication → Providers → Google** を開く
2. Google Cloud Console で発行した **Client ID / Client Secret** を入力して有効化
   (発行手順は [SETUP.md](./SETUP.md) の手順3参照)
3. **Authentication → URL Configuration**
   - Site URL: 本番 URL(開発中は `http://localhost:3000`)
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://<本番ドメイン>/auth/callback`

## 5. スキーマ反映と初期データ

ローカルから:

```bash
npm run db:push   # prisma/schema.prisma を DB に反映
npm run db:seed   # 初期データ投入
```

## 6. RLS の適用

**SQL Editor** で [`supabase/rls.sql`](../supabase/rls.sql) を実行。

適用後、**Table Editor → 各テーブル → RLS enabled** になっていることを確認してください。

## 7. セキュリティモデルの整理

| 経路 | 認可 |
|---|---|
| Next.js サーバー(Prisma) | アプリ層の `requireUser` / `requireRole` で制御(推奨経路) |
| Supabase クライアント(anon) | 本アプリでは Auth のみに使用。データアクセスは RLS が防御 |

- 利用者は自分の情報のみ閲覧可能
- スタッフは利用者情報の閲覧・チェック・記録が可能
- マスタ(ポイント設定・商品・実績など)の編集は管理者のみ
