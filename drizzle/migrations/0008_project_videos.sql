CREATE TABLE public.project_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT 'video/mp4',
  size_bytes bigint NOT NULL DEFAULT 0,
  poster_url text NOT NULL DEFAULT '',
  poster_path text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_videos_mime CHECK (mime_type IN ('video/mp4','video/webm','video/quicktime')),
  CONSTRAINT project_videos_size CHECK (size_bytes >= 0 AND size_bytes <= 104857600)
);
CREATE INDEX project_videos_project_idx ON public.project_videos(project_id, sort_order);
GRANT SELECT ON public.project_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_videos TO authenticated;
GRANT ALL ON public.project_videos TO service_role;
ALTER TABLE public.project_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage project videos" ON public.project_videos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Videos of published projects are publicly readable" ON public.project_videos FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_videos.project_id AND p.is_published));

CREATE POLICY "Admins manage work videos" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'work-videos' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'work-videos' AND public.has_role(auth.uid(),'admin')
    AND lower(name) ~ '\.(mp4|webm|mov)$');
CREATE POLICY "Public read of published work videos" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'work-videos' AND EXISTS (
    SELECT 1 FROM public.project_videos v JOIN public.projects p ON p.id = v.project_id
    WHERE v.storage_path = storage.objects.name AND p.is_published));