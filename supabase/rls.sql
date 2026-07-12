-- ============================================================
-- GGH ライフポイント管理アプリ Row Level Security (RLS) 設定
--
-- Supabase の SQL Editor で実行してください。
--
-- 【アーキテクチャ上の注意】
-- 本アプリのデータアクセスは Next.js のサーバー側(Prisma)経由で行い、
-- Prisma は postgres ロールで接続するため RLS の対象外です。
-- 権限チェックはアプリ層(requireRole)で行っています。
-- この RLS は「anon キーで PostgREST に直接アクセスされた場合」の
-- 多層防御(defense in depth)として設定します。
-- ============================================================

-- ------------------------------------------------------------
-- ヘルパー関数: ログイン中ユーザーのロールを取得
-- ------------------------------------------------------------
create or replace function public.current_app_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role::text from public.users where id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 全テーブルで RLS を有効化
-- ------------------------------------------------------------
alter table public.users             enable row level security;
alter table public.point_actions     enable row level security;
alter table public.point_logs        enable row level security;
alter table public.achievements      enable row level security;
alter table public.user_achievements enable row level security;
alter table public.mission_templates enable row level security;
alter table public.user_missions     enable row level security;
alter table public.reward_items      enable row level security;
alter table public.reward_exchanges  enable row level security;
alter table public.notifications     enable row level security;
alter table public.support_records   enable row level security;
alter table public.staff_comments    enable row level security;
alter table public.announcements     enable row level security;
alter table public.events            enable row level security;
alter table public.app_settings      enable row level security;

-- ------------------------------------------------------------
-- users: 自分の行のみ閲覧可 / スタッフ・管理者は全員閲覧可
--        更新は管理者のみ(表示設定は本人も可)
-- ------------------------------------------------------------
create policy "users_select_self_or_staff" on public.users
  for select using (
    id = auth.uid() or public.current_app_role() in ('STAFF', 'ADMIN')
  );

create policy "users_update_self_visibility" on public.users
  for update using (id = auth.uid())
  with check (id = auth.uid());

create policy "users_all_admin" on public.users
  for all using (public.current_app_role() = 'ADMIN');

-- ------------------------------------------------------------
-- マスタ系(行動 / 実績 / ミッション / 商品 / お知らせ / イベント):
--   閲覧は全ログインユーザー / 変更は管理者のみ
-- ------------------------------------------------------------
create policy "point_actions_select" on public.point_actions
  for select using (auth.uid() is not null);
create policy "point_actions_admin" on public.point_actions
  for all using (public.current_app_role() = 'ADMIN');

create policy "achievements_select" on public.achievements
  for select using (auth.uid() is not null);
create policy "achievements_admin" on public.achievements
  for all using (public.current_app_role() = 'ADMIN');

create policy "mission_templates_select" on public.mission_templates
  for select using (auth.uid() is not null);
create policy "mission_templates_admin" on public.mission_templates
  for all using (public.current_app_role() = 'ADMIN');

create policy "reward_items_select" on public.reward_items
  for select using (auth.uid() is not null);
create policy "reward_items_admin" on public.reward_items
  for all using (public.current_app_role() = 'ADMIN');

create policy "announcements_select" on public.announcements
  for select using (auth.uid() is not null and is_published);
create policy "announcements_admin" on public.announcements
  for all using (public.current_app_role() = 'ADMIN');

create policy "events_select" on public.events
  for select using (auth.uid() is not null);
create policy "events_admin" on public.events
  for all using (public.current_app_role() = 'ADMIN');

create policy "app_settings_select" on public.app_settings
  for select using (auth.uid() is not null);
create policy "app_settings_admin" on public.app_settings
  for all using (public.current_app_role() = 'ADMIN');

-- ------------------------------------------------------------
-- 個人データ系: 本人のみ閲覧 / スタッフ・管理者は閲覧・記入可
-- ------------------------------------------------------------
create policy "point_logs_select" on public.point_logs
  for select using (
    user_id = auth.uid() or public.current_app_role() in ('STAFF', 'ADMIN')
  );
create policy "point_logs_write_staff" on public.point_logs
  for all using (public.current_app_role() in ('STAFF', 'ADMIN'));

create policy "user_achievements_select" on public.user_achievements
  for select using (
    user_id = auth.uid() or public.current_app_role() in ('STAFF', 'ADMIN')
  );

create policy "user_missions_select" on public.user_missions
  for select using (
    user_id = auth.uid() or public.current_app_role() in ('STAFF', 'ADMIN')
  );

create policy "reward_exchanges_select" on public.reward_exchanges
  for select using (
    user_id = auth.uid() or public.current_app_role() in ('STAFF', 'ADMIN')
  );
create policy "reward_exchanges_insert_self" on public.reward_exchanges
  for insert with check (user_id = auth.uid());
create policy "reward_exchanges_staff" on public.reward_exchanges
  for update using (public.current_app_role() in ('STAFF', 'ADMIN'));

create policy "notifications_select_self" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications_update_self" on public.notifications
  for update using (user_id = auth.uid());

-- 支援記録・コメントはスタッフ/管理者のみ(利用者本人のコメントは閲覧可)
create policy "staff_comments_select" on public.staff_comments
  for select using (
    user_id = auth.uid() or public.current_app_role() in ('STAFF', 'ADMIN')
  );
create policy "staff_comments_write" on public.staff_comments
  for all using (public.current_app_role() in ('STAFF', 'ADMIN'));

create policy "support_records_staff_only" on public.support_records
  for all using (public.current_app_role() in ('STAFF', 'ADMIN'));
