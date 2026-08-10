ALTER TABLE public.estimates
  ADD COLUMN IF NOT EXISTS public_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS approved_snapshot jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS estimates_public_token_key ON public.estimates (public_token);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL DEFAULT '',
  estimate_id uuid REFERENCES public.estimates(id) ON DELETE SET NULL,
  estimate_number text NOT NULL DEFAULT '',
  customer_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric NOT NULL DEFAULT 0,
  approved_at timestamptz,
  status text NOT NULL DEFAULT 'new',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage orders" ON public.orders FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS orders_estimate_id_key ON public.orders (estimate_id);

CREATE OR REPLACE FUNCTION public.lock_approved_estimate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.approved_at IS NOT NULL THEN
    IF (NEW.items IS DISTINCT FROM OLD.items)
       OR (NEW.total IS DISTINCT FROM OLD.total)
       OR (NEW.discount_type IS DISTINCT FROM OLD.discount_type)
       OR (NEW.discount_value IS DISTINCT FROM OLD.discount_value)
       OR (NEW.number IS DISTINCT FROM OLD.number)
       OR (NEW.approved_snapshot IS DISTINCT FROM OLD.approved_snapshot)
       OR (NEW.approved_at IS DISTINCT FROM OLD.approved_at) THEN
      RAISE EXCEPTION 'Смета уже согласована заказчиком и не может быть изменена';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS estimates_lock_approved ON public.estimates;
CREATE TRIGGER estimates_lock_approved BEFORE UPDATE ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.lock_approved_estimate();