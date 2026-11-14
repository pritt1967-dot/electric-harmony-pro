ALTER POLICY "Public read of project photos" ON storage.objects
USING (
  bucket_id = 'projects'
  AND (
    EXISTS (
      SELECT 1 FROM public.project_images i
      JOIN public.projects p ON p.id = i.project_id
      WHERE i.storage_path = storage.objects.name AND p.is_published
    )
    OR EXISTS (
      SELECT 1 FROM public.project_videos v
      JOIN public.projects p ON p.id = v.project_id
      WHERE v.poster_path = storage.objects.name AND p.is_published
    )
    OR EXISTS (
      SELECT 1 FROM public.published_client_reviews() r
      WHERE r.photo_path = storage.objects.name AND r.photo_path <> ''
    )
    OR (
      storage.objects.name = '6415eed6-2be1-4060-8611-f2541e8e9026/ev7-review-profi.jpg'
      AND EXISTS (
        SELECT 1 FROM public.projects p
        WHERE p.id = '6415eed6-2be1-4060-8611-f2541e8e9026'::uuid AND p.is_published
      )
    )
  )
);