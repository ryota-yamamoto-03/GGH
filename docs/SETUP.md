# 初回セットアップ手順

ローカル開発環境の構築から動作確認までの手順です。

## 前提

- Node.js 18.18 以上(推奨: 20 以上)
- npm
- Google アカウント(OAuth 設定用)
- Supabase アカウント(無料プランでOK)

## 1. リポジトリの準備

```bash
git clone <このリポジトリ>
cd GGH
npm install
```

## 2. Supabase プロジェクトの作成

詳細は [SUPABASE.md](./SUPABASE.md) を参照。ここでは概要のみ:

1. https://supabase.com で新規プロジェクトを作成(リージョン: Tokyo 推奨)
2. **Settings → API** から以下をメモ
   - `Project URL`
   - `anon public` キー
3. **Settings → Database → Connection string** から接続文字列をメモ
   - Transaction pooler(ポート 6543)
   - Direct connection(ポート 5432)

## 3. Google OAuth の設定

1. [Google Cloud Console](https://console.cloud.google.com/) で新規プロジェクトを作成
2. **APIとサービス → OAuth同意画面** を設定(External / アプリ名など入力)
3. **APIとサービス → 認証情報 → OAuthクライアントID** を作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みリダイレクトURI:
     `https://<プロジェクトID>.supabase.co/auth/v1/callback`
4. 発行された **クライアントID / シークレット** を
   Supabase の **Authentication → Providers → Google** に設定して有効化
5. Supabase の **Authentication → URL Configuration** で
   - Site URL: `http://localhost:3000`(本番では本番URL)
   - Redirect URLs に `http://localhost:3000/auth/callback` を追加

## 4. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集して手順2でメモした値を設定します。

## 5. データベースの初期化

```bash
# スキーマを Supabase に反映
npm run db:push

# 初期データ(行動マスタ・実績・ミッション・商品)を投入
npm run db:seed
```

## 6. RLS(Row Level Security)の設定

Supabase ダッシュボードの **SQL Editor** で
[`supabase/rls.sql`](../supabase/rls.sql) の内容を実行します。

## 7. 起動

```bash
npm run dev
```

http://localhost:3000 を開き、Google ログインできれば成功です。

## 8. 管理者アカウントの設定

初回ログインしたユーザーは「利用者(USER)」として登録されます。
最初の管理者は SQL で昇格させます(Supabase SQL Editor):

```sql
update public.users set role = 'ADMIN' where email = 'あなたのメールアドレス';
```

以降は管理者画面(`/admin`)の「ユーザー管理」タブからロールを変更できます。

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| **500 (INTERNAL_SERVER_ERROR)** | まず **`/api/health`** にアクセスして診断結果を確認。①環境変数未設定(Vercel は設定後に**再デプロイが必要**)②`npm run db:push` 未実行(テーブル未作成)③`DATABASE_URL` の形式ミス、のいずれかがほとんどです |
| ログイン後にループする | Supabase の Redirect URLs に `/auth/callback` を追加したか確認 |
| `P1001`(DB接続不可) | `DATABASE_URL` のパスワード・ホストを確認。IPv4環境では pooler 接続を使用 |
| ポイントが加算されない | スタッフ/管理者ロールでログインしているか確認(利用者は自己付与不可) |
| ミッションが表示されない | ダッシュボードを一度開くと当日分が自動生成されます |
