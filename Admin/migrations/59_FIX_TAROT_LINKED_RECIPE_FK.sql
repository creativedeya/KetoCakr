-- Migration 59: Fix tarot_cards.linked_recipe_id FK
-- The original migration 58 incorrectly pointed linked_recipe_id to base_recipes(id).
-- Major Arcana cards link to a complete assembled cake (ready_recipes), not a component (base_recipes).
-- Run in Supabase SQL Editor ONLY if migration 58 was already executed.

alter table public.tarot_cards
  drop constraint if exists tarot_cards_linked_recipe_id_fkey;

alter table public.tarot_cards
  add constraint tarot_cards_linked_recipe_id_fkey
  foreign key (linked_recipe_id) references public.ready_recipes(id);
