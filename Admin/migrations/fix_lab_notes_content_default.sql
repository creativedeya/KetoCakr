-- Fix NOT NULL constraint violation on lab_notes.content / content_bg
-- The content + content_bg columns are legacy text fields not used by the API
-- (structured data lives in content_json). Give them empty-string defaults so
-- inserts that omit them don't fail.

ALTER TABLE lab_notes
  ALTER COLUMN content     SET DEFAULT '',
  ALTER COLUMN content_bg  SET DEFAULT '';

-- Back-fill any existing NULL rows (shouldn't exist, but just in case)
UPDATE lab_notes
   SET content    = COALESCE(content,    ''),
       content_bg = COALESCE(content_bg, '')
 WHERE content IS NULL OR content_bg IS NULL;
