alter table public.tarot_cards
  add column if not exists image_source_mode character varying(10) not null default 'recipe';
