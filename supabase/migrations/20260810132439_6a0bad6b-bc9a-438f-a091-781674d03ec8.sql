CREATE TABLE public.panel_schematics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  object_name text NOT NULL DEFAULT '',
  panel_design_id uuid REFERENCES public.panel_designs(id) ON DELETE SET NULL,
  doc jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.panel_schematics TO authenticated;
GRANT ALL ON public.panel_schematics TO service_role;
ALTER TABLE public.panel_schematics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage panel schematics" ON public.panel_schematics FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER panel_schematics_updated_at BEFORE UPDATE ON public.panel_schematics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();