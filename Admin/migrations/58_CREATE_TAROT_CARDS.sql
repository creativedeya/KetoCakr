-- Migration 58: Create tarot_cards table
-- Run in Supabase SQL Editor
-- NOTE: Requires the update_updated_at() trigger function to already exist (used by other tables)
-- NOTE: Create the 'tarot-images' storage bucket in Supabase Dashboard before uploading card images

create table public.tarot_cards (
  id uuid not null default gen_random_uuid(),
  card_number integer not null,
  suit character varying(20) null,
  arcana_type character varying(10) not null,
  card_name character varying(100) not null,
  card_name_en character varying(100) null,
  theme character varying(150) null,
  theme_en character varying(150) null,
  recipe_role_id integer null references public.recipe_roles(id),
  linked_recipe_id uuid null references public.ready_recipes(id),
  daily_phrase text not null,
  daily_phrase_en text null,
  energy_word character varying(50) not null,
  energy_word_en character varying(50) null,
  morning_tip text not null,
  morning_tip_en text null,
  daily_trap text not null,
  daily_trap_en text null,
  evening_question text not null,
  evening_question_en text null,
  card_image_url text null,
  is_published boolean not null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint tarot_cards_pkey primary key (id),
  constraint tarot_cards_unique_card unique (arcana_type, suit, card_number)
);

create index idx_tarot_cards_arcana_type on public.tarot_cards using btree (arcana_type);
create index idx_tarot_cards_suit on public.tarot_cards using btree (suit);
create index idx_tarot_cards_role on public.tarot_cards using btree (recipe_role_id);
create index idx_tarot_cards_published on public.tarot_cards using btree (is_published);

create trigger tarot_cards_updated_at before update on public.tarot_cards
  for each row execute function update_updated_at();

-- Enable RLS (anon reads published cards; service role can write)
alter table public.tarot_cards enable row level security;

create policy "Anyone can read published tarot cards"
  on public.tarot_cards for select
  using (is_published = true);

create policy "Service role has full access"
  on public.tarot_cards for all
  using (auth.role() = 'service_role');
