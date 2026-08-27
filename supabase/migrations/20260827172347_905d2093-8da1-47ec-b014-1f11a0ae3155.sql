CREATE TABLE public.commercial_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE SET NULL,
  number text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.commercial_offers TO authenticated;
GRANT ALL ON public.commercial_offers TO service_role;

ALTER TABLE public.commercial_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage commercial offers"
ON public.commercial_offers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX commercial_offers_estimate_idx ON public.commercial_offers (estimate_id, version DESC);

CREATE TRIGGER update_commercial_offers_updated_at
BEFORE UPDATE ON public.commercial_offers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();