ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS task text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS works_done text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS equipment text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS result_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS cost_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS service_slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description text NOT NULL DEFAULT '';

ALTER TABLE public.project_images
  ADD COLUMN IF NOT EXISTS alt text NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.slugify_ru(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(lower(
    translate(
      input,
      'абвгдезийклмнопрстуфхцыэАБВГДЕЗИЙКЛМНОПРСТУФХЦЫЭ',
      'abvgdezijklmnoprstufхcyeabvgdezijklmnoprstufhcye'
    )
  ), '[^a-z0-9]+', '-', 'g'));
$$;

UPDATE public.projects
SET slug = COALESCE(NULLIF(slug, ''), NULLIF(public.slugify_ru(title), '') , 'obekt-' || left(id::text, 8))
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_key ON public.projects (slug);