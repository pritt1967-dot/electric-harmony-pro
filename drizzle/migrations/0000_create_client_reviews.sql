CREATE TABLE public.client_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT ''::text,
  location text NOT NULL DEFAULT ''::text,
  rating integer NOT NULL DEFAULT 5,
  text text NOT NULL DEFAULT ''::text,
  photo_path text NOT NULL DEFAULT ''::text,
  status text NOT NULL DEFAULT 'pending'::text,
  consent boolean NOT NULL DEFAULT false,
  ip_hash text NOT NULL DEFAULT ''::text,
  admin_note text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  published_at timestamp with time zone,
  CONSTRAINT client_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT client_reviews_status_allowed CHECK (status IN ('pending','published','rejected'))
);

CREATE INDEX client_reviews_status_created_idx ON public.client_reviews (status, created_at DESC);
CREATE INDEX client_reviews_ip_hash_created_idx ON public.client_reviews (ip_hash, created_at DESC);

GRANT INSERT ON public.client_reviews TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.client_reviews TO authenticated;
GRANT ALL ON public.client_reviews TO service_role;

ALTER TABLE public.client_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a review"
  ON public.client_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending' AND consent = true AND published_at IS NULL);

CREATE POLICY "Admins manage client reviews"
  ON public.client_reviews FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER client_reviews_updated_at
  BEFORE UPDATE ON public.client_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();