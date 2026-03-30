-- 1. Fix missing domain column from the original schema
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'Other';

-- 2. Create a public storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. In case RLS blocks public uploads to this new bucket, we add a policy enabling it
-- Note: It is generally safe to allow anonymous uploads for this specific form workflow, 
-- but in strict production, you'd restrict this to authenticated users.
CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public Views" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'images');
