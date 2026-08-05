CREATE TABLE public.price_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'Общие',
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'шт',
  price numeric(12,2) NOT NULL DEFAULT 0,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_items TO authenticated;
GRANT ALL ON public.price_items TO service_role;
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage price items" ON public.price_items FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER price_items_updated_at BEFORE UPDATE ON public.price_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL DEFAULT '',
  doc_date date NOT NULL DEFAULT current_date,
  customer_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  work_period text NOT NULL DEFAULT '',
  valid_until text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  total numeric(14,2) NOT NULL DEFAULT 0,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estimates TO authenticated;
GRANT ALL ON public.estimates TO service_role;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage estimates" ON public.estimates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER estimates_updated_at BEFORE UPDATE ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.price_items (category, name, unit, price, comment) VALUES
('Электромонтаж', 'Монтаж розетки/выключателя (открытая установка)', 'шт', 450, ''),
('Электромонтаж', 'Установка подрозетника в бетон', 'шт', 400, ''),
('Электромонтаж', 'Штробление стены под кабель (бетон)', 'м', 550, ''),
('Электромонтаж', 'Прокладка кабеля ВВГнг до 3х2.5', 'м', 120, ''),
('Электромонтаж', 'Монтаж гофры/кабель-канала', 'м', 90, ''),
('Электрощиты', 'Сборка щита учёта до 12 модулей', 'шт', 4500, 'Без стоимости оборудования'),
('Электрощиты', 'Сборка щита от 24 модулей', 'шт', 9000, ''),
('Электрощиты', 'Установка автоматического выключателя', 'шт', 350, ''),
('Электрощиты', 'Установка УЗО/дифавтомата', 'шт', 500, ''),
('Заземление', 'Монтаж модульного заземления (комплект 3 м)', 'компл', 12000, ''),
('Заземление', 'Забивка заземляющего электрода', 'м', 1500, ''),
('Электроизмерения', 'Замер сопротивления заземления', 'изм', 3500, 'С протоколом'),
('Электроизмерения', 'Замер сопротивления изоляции', 'линия', 800, ''),
('Зарядные станции', 'Подключение зарядной станции для электромобиля', 'шт', 15000, 'Без стоимости станции');