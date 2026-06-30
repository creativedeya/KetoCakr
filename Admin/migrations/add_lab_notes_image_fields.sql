-- Add image support to lab_notes
ALTER TABLE lab_notes
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_alt TEXT;

CREATE INDEX IF NOT EXISTS idx_lab_notes_image ON lab_notes(image_url);

-- Storage bucket: create via Supabase Dashboard or CLI
-- Bucket name: lab-notes, Public: YES, Max file size: 5MB

-- RLS policies for lab-notes storage bucket
CREATE POLICY "Public read access for lab note images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lab-notes');

CREATE POLICY "Admin upload access for lab note images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lab-notes');

CREATE POLICY "Admin update access for lab note images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lab-notes');

CREATE POLICY "Admin delete access for lab note images"
ON storage.objects FOR DELETE
USING (bucket_id = 'lab-notes');
