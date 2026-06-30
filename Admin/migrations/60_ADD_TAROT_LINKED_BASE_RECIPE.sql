-- Migration 60: Add linked_base_recipe_id to tarot_cards
-- Minor Arcana cards can now link to ONE specific base_recipes component
-- (e.g. "Орехов блат" for a Pentacles card), separate from recipe_role_id
-- which stays as a role/category field.
-- Major Arcana still uses linked_recipe_id → ready_recipes(id).

alter table public.tarot_cards
  add column if not exists linked_base_recipe_id uuid null
  references public.base_recipes(id);
