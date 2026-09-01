-- ForgeLab Mobile v1.8.9
-- Synchronisation du Carnet + brouillons entre Safari et la PWA iPhone.
-- Chaque utilisateur ne peut voir/modifier que ses propres données.

create table if not exists public.forgelab_journal_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sessions jsonb not null default '[]'::jsonb,
  drafts jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.forgelab_journal_state enable row level security;

drop policy if exists "forgelab_journal_select_own" on public.forgelab_journal_state;
drop policy if exists "forgelab_journal_insert_own" on public.forgelab_journal_state;
drop policy if exists "forgelab_journal_update_own" on public.forgelab_journal_state;
drop policy if exists "forgelab_journal_delete_own" on public.forgelab_journal_state;

create policy "forgelab_journal_select_own"
on public.forgelab_journal_state
for select
to authenticated
using (auth.uid() = user_id);

create policy "forgelab_journal_insert_own"
on public.forgelab_journal_state
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "forgelab_journal_update_own"
on public.forgelab_journal_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "forgelab_journal_delete_own"
on public.forgelab_journal_state
for delete
to authenticated
using (auth.uid() = user_id);

grant select, insert, update, delete
on table public.forgelab_journal_state
to authenticated;
