ALTER TABLE public.price_items
  ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS public_category text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS price_from boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS in_calculator boolean NOT NULL DEFAULT false;

UPDATE public.price_items SET public_category = CASE
  WHEN category LIKE 'Электрощит%' OR category = 'Электрощиты' THEN 'Электрические щиты'
  WHEN category IN ('Потолочное/настенное освещение','Светодиодная лента','Трековые системы освещения') THEN 'Освещение'
  WHEN category IN ('Розетки и выключатели','Подрозетники') THEN 'Розетки и выключатели'
  WHEN category IN ('Прокладка кабеля','Монтаж кабель-канала','Ретро-проводка') THEN 'Кабельные линии'
  WHEN category = 'Заземление' THEN 'Заземление'
  WHEN category IN ('Ремонтные работы','Электроизмерения') THEN 'Поиск и устранение неисправностей'
  WHEN category IN ('Электромонтаж','Штробление','Проходки: сквозное сверление стен','Распределительные коробки') THEN 'Электромонтажные работы'
  ELSE 'Дополнительные работы'
END
WHERE public_category = '';

WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY public_category ORDER BY price ASC) AS rn
  FROM public.price_items
  WHERE price > 0
)
UPDATE public.price_items p
SET is_public = true, in_calculator = true, sort_order = r.rn * 10
FROM ranked r
WHERE p.id = r.id AND r.rn <= 6;

GRANT SELECT ON public.price_items TO anon;

CREATE POLICY "Public price items are readable"
ON public.price_items FOR SELECT
TO anon, authenticated
USING (is_public = true);