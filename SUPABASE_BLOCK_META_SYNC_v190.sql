-- ForgeLab — synchro des métadonnées du bloc actif PC ↔ Mobile
-- À exécuter une seule fois dans Supabase > SQL Editor.

alter table public.forgelab_state
  add column if not exists block_name text,
  add column if not exists block_duration integer,
  add column if not exists nutrition_context text,
  add column if not exists updated_at timestamptz default now();

alter table public.forgelab_state
  drop constraint if exists forgelab_state_block_duration_check;

alter table public.forgelab_state
  add constraint forgelab_state_block_duration_check
  check (block_duration is null or (block_duration >= 1 and block_duration <= 16));

alter table public.forgelab_state
  drop constraint if exists forgelab_state_nutrition_context_check;

alter table public.forgelab_state
  add constraint forgelab_state_nutrition_context_check
  check (nutrition_context is null or nutrition_context in ('deficit','maintenance','surplus'));
