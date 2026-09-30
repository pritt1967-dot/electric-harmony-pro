CREATE OR REPLACE FUNCTION public.client_review_recent_count(_ip_hash text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT count(*)::int FROM public.client_reviews
  WHERE ip_hash = _ip_hash AND created_at >= now() - interval '1 hour'
$$;
REVOKE ALL ON FUNCTION public.client_review_recent_count(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.client_review_recent_count(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid) THEN
      RETURN 'ok';
    END IF;
    RETURN 'exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN 'bootstrapped';
END $$;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE POLICY "Anyone can upload review photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'projects' AND name LIKE 'reviews/%' AND position('/' in substr(name, 9)) = 0);