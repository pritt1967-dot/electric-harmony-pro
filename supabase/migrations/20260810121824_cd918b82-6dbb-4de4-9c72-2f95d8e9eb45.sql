ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS object_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS approved_ip text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS approved_session text NOT NULL DEFAULT '';

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS object_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS paid_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS prepayment_percent numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimate_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS approved_snapshot jsonb;

CREATE TABLE IF NOT EXISTS public.estimate_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimate_versions TO authenticated;
GRANT ALL ON public.estimate_versions TO service_role;
ALTER TABLE public.estimate_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage estimate versions"
  ON public.estimate_versions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS estimate_versions_estimate_idx
  ON public.estimate_versions(estimate_id, version);

CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'note',
  message text NOT NULL DEFAULT '',
  from_status text NOT NULL DEFAULT '',
  to_status text NOT NULL DEFAULT '',
  actor text NOT NULL DEFAULT 'system',
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_events TO authenticated;
GRANT ALL ON public.order_events TO service_role;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage order events"
  ON public.order_events FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS order_events_order_idx
  ON public.order_events(order_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.snapshot_estimate_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.approved_at IS NULL AND (
       NEW.items IS DISTINCT FROM OLD.items
    OR NEW.total IS DISTINCT FROM OLD.total
    OR NEW.discount_type IS DISTINCT FROM OLD.discount_type
    OR NEW.discount_value IS DISTINCT FROM OLD.discount_value
  ) THEN
    INSERT INTO public.estimate_versions (estimate_id, version, snapshot, is_approved)
    VALUES (
      OLD.id,
      OLD.version,
      jsonb_build_object(
        'number', OLD.number,
        'doc_date', OLD.doc_date,
        'customer_name', OLD.customer_name,
        'address', OLD.address,
        'object_name', OLD.object_name,
        'items', OLD.items,
        'total', OLD.total,
        'discount_type', OLD.discount_type,
        'discount_value', OLD.discount_value
      ),
      false
    );
    NEW.version := OLD.version + 1;
  END IF;

  IF OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL THEN
    INSERT INTO public.estimate_versions (estimate_id, version, snapshot, is_approved)
    VALUES (
      OLD.id,
      NEW.version,
      COALESCE(NEW.approved_snapshot, '{}'::jsonb),
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS estimates_version_snapshot ON public.estimates;
CREATE TRIGGER estimates_version_snapshot
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_estimate_version();