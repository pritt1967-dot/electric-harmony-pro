CREATE TABLE public.panel_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  design jsonb,
  image text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panel_designs TO authenticated;
GRANT ALL ON public.panel_designs TO service_role;
ALTER TABLE public.panel_designs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage panel designs" ON public.panel_designs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER panel_designs_updated_at BEFORE UPDATE ON public.panel_designs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();