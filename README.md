# 🎮 GGH ライフポイント管理アプリ

> **ゲームを通して生活リズムを整え、社会参加を応援する。**

精神障がい者向けゲーミンググループホームで利用する、ライフポイント(LP)管理 Web アプリです。
「レベルアップ」「実績」「クエスト」といったゲームの仕組みで、毎日の生活を楽しくします。

> ※ ポイント制度は利用者を競わせるためではなく、**自己成長を可視化するための仕組み**です。

## ✨ 主な機能

| 機能 | 内容 |
|---|---|
| 🔑 Google ログイン | Supabase Auth + Google OAuth。利用者/スタッフ/管理者のロール管理 |
| 🏠 ホーム画面 | ゲームのステータス画面風。レベル・LP・経験値バー・ミッション・実績・ランキング |
| ⭐ ライフポイント | 起床5PT・服薬10PT・B型作業所40PT など。管理者が自由に変更可能 |
| 📈 レベル制度 | Lv1新人冒険者 → Lv5ブロンズ → Lv10シルバー → Lv20ゴールド → Lv30プラチナ → Lv50ダイヤ → Lv100レジェンド |
| 🏆 実績システム | Steam実績風。初ログイン・30日連続服薬・隠し実績など。ボーナスLP付き |
| 🎯 ミッション | デイリー(毎日自動生成)/ ウィークリー(毎週月曜生成)。行動チェックで自動進捗 |
| 🎁 ポイント交換所 | ゲームショップ風。お菓子からゲーミングチェアまで。管理者が商品を自由に管理 |
| 🧑‍⚕️ スタッフ画面 | 利用者一覧・今日の行動チェック(タップで自動加算)・コメント・支援記録・CSV出力 |
| 🛠 管理者画面 | ユーザー/ロール・ポイント設定・実績・ミッション・商品・お知らせ・イベント・ランキングON/OFF |
| 🔔 通知 | ポイント獲得・レベルアップ・ミッション・交換完了・イベント・お知らせ |
| 📊 分析 | 週間/月間活動・外出率・服薬率・生活リズム・獲得ポイント推移 |
| 🌙 UI | 白×水色×青の近未来ゲームUI。アニメーション多数。レスポンシブ&ダークモード完全対応 |

## 🛠 技術スタック

- **Next.js 14**(App Router / Server Components / Server Actions)
- **TypeScript**(strict)
- **TailwindCSS + shadcn/ui**(カスタムゲームテーマ)
- **framer-motion**(アニメーション)/ **recharts**(グラフ)
- **Supabase**(PostgreSQL + Auth + RLS)
- **Prisma**(ORM)
- **Google OAuth** / **Vercel**(デプロイ)

## 📁 ディレクトリ構成

```
GGH/
├── prisma/
│   ├── schema.prisma        # DBスキーマ(全テーブル定義)
│   └── seed.ts              # 初期データ(行動・実績・ミッション・商品)
├── supabase/
│   └── rls.sql              # Row Level Security ポリシー
├── docs/                    # ドキュメント一式
│   ├── ER.md                # ER図(mermaid)
│   ├── SETUP.md             # 初回セットアップ手順
│   ├── SUPABASE.md          # Supabase セットアップ詳細
│   ├── DEPLOY.md            # Vercel デプロイ手順
│   └── ROADMAP.md           # MVP → β → 正式版ロードマップ
└── src/
    ├── middleware.ts        # 認証ガード(Supabase セッション更新)
    ├── app/
    │   ├── page.tsx         # ランディング
    │   ├── login/           # Google ログイン
    │   ├── auth/callback/   # OAuth コールバック
    │   ├── api/export/      # CSV 出力 API
    │   └── (app)/           # ログイン後の全画面(共通レイアウト)
    │       ├── dashboard/   # ホーム(ステータス画面)
    │       ├── missions/    # ミッション
    │       ├── achievements/# 実績
    │       ├── shop/        # ポイント交換所
    │       ├── ranking/     # ランキング
    │       ├── analytics/   # 分析(グラフ)
    │       ├── history/     # ポイント履歴
    │       ├── staff/       # スタッフ画面(一覧・詳細・チェック)
    │       └── admin/       # 管理者画面
    ├── actions/             # Server Actions(ポイント・交換・管理)
    ├── components/
    │   ├── ui/              # shadcn/ui ベースコンポーネント
    │   ├── layout/          # アプリシェル(サイドバー・ナビ)
    │   ├── game/            # ゲームUI(レベルカード・ミッション等)
    │   ├── staff/           # スタッフ用コンポーネント
    │   └── admin/           # 管理者用コンポーネント
    └── lib/
        ├── auth.ts          # 認証・ロール制御・実績解除
        ├── level.ts         # レベル・ランク計算ロジック
        ├── prisma.ts        # Prisma シングルトン
        ├── supabase/        # Supabase クライアント(browser/server/middleware)
        └── utils.ts         # 汎用ユーティリティ
```

## 🚀 クイックスタート

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定(Supabase / Google OAuth の値を入れる)
cp .env.example .env

# 3. DBスキーマ反映 + 初期データ投入
npm run db:push
npm run db:seed

# 4. 起動
npm run dev
```

詳細な手順は **[docs/SETUP.md](docs/SETUP.md)** を参照してください。

- Supabase 設定: [docs/SUPABASE.md](docs/SUPABASE.md)
- Vercel デプロイ: [docs/DEPLOY.md](docs/DEPLOY.md)
- DB設計 / ER図: [docs/ER.md](docs/ER.md)
- ロードマップ: [docs/ROADMAP.md](docs/ROADMAP.md)

## 🔐 セキュリティ

- Supabase Auth(Google OAuth のみ・パスワードレス)
- サーバー側で全ページ・全アクションのロール検証(`requireUser` / `requireRole`)
- Row Level Security による多層防御(利用者は自分の情報のみ閲覧可能)
- マスタ編集は管理者のみ / ポイント付与はスタッフ・管理者のみ

## 🔮 将来的な拡張(設計済み)

GPS外出記録(本人同意前提)・家族向け閲覧画面・訪問看護画面・相談支援専門員画面・
B型作業所連携・AI生活リズム分析・Discord/LINE通知 — 詳細は [ROADMAP.md](docs/ROADMAP.md)。

## 📝 ライセンス

施設内部利用を想定した非公開プロジェクトです。
