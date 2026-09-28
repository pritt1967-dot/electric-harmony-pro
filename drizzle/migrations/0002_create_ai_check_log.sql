CREATE TABLE public.ai_check_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint text NOT NULL,
  status text NOT NULL DEFAULT 'ok',
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ai_check_log_user_created_idx ON public.ai_check_log (user_id, created_at DESC);
CREATE INDEX ai_check_log_fp_idx ON public.ai_check_log (fingerprint, created_at DESC);
GRANT SELECT, INSERT ON public.ai_check_log TO authenticated;
GRANT ALL ON public.ai_check_log TO service_role;
ALTER TABLE public.ai_check_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read ai check log" ON public.ai_check_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert own ai check log" ON public.ai_check_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));