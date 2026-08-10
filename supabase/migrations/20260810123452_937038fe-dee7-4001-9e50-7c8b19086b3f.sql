DROP POLICY "Published projects are publicly readable" ON public.projects;
DROP POLICY "Images of published projects are publicly readable" ON public.project_images;

CREATE POLICY "Published projects are publicly readable"
  ON public.projects FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Images of published projects are publicly readable"
  ON public.project_images FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_images.project_id AND p.is_published = true
  ));