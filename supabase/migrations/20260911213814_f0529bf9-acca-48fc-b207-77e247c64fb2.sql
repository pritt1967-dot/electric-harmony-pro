ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS customer_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS lights_text text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS warranty_text text NOT NULL DEFAULT '';

COMMENT ON COLUMN public.projects.customer_name IS 'Заказчик проекта';
COMMENT ON COLUMN public.projects.lights_text IS 'Отдельный блок о светильниках';
COMMENT ON COLUMN public.projects.warranty_text IS 'Отдельный блок о гарантии';