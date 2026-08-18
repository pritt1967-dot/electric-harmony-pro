CREATE POLICY "Public read of project photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'projects');