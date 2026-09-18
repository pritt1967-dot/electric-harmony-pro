CREATE OR REPLACE FUNCTION public.published_client_reviews()
RETURNS TABLE (
  id uuid,
  name text,
  location text,
  rating integer,
  text text,
  photo_path text,
  published_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.id, r.name, r.location, r.rating, r.text, r.photo_path,
         COALESCE(r.published_at, r.created_at)
  FROM public.client_reviews r
  WHERE r.status = 'published'
  ORDER BY COALESCE(r.published_at, r.created_at) DESC
$$;

GRANT EXECUTE ON FUNCTION public.published_client_reviews() TO anon, authenticated, service_role;