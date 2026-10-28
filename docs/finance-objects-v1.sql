-- Учёт объектов и выполненных работ — ОТДЕЛЬНАЯ финансовая база.
-- Только добавочные изменения: существующие таблицы, строки, балансы и
-- представления не меняются. Повторное применение безопасно.
-- Выполнять владельцем базы (SQL Editor финансового проекта), не в базе сайта.

BEGIN;

-- 0. Стоп-проверка: если на operations.operation_type есть CHECK без
-- customer_refund, миграция прерывается целиком — ничего не применяется.
DO $$
DECLARE d text;
BEGIN
  FOR d IN
    SELECT pg_get_constraintdef(c.oid) FROM pg_constraint c
    WHERE c.conrelid = 'public.operations'::regclass AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%operation_type%'
  LOOP
    IF d NOT ILIKE '%customer_refund%' THEN
      RAISE EXCEPTION 'operations.operation_type ограничен (%). Нужно отдельное согласование, миграция отменена.', d;
    END IF;
  END LOOP;
END $$;

-- 1. Сведения объекта (1:1 с projects, существующие поля не трогаем).
CREATE TABLE IF NOT EXISTS public.finance_object_details (
  project_id   uuid PRIMARY KEY REFERENCES public.projects(id) ON DELETE RESTRICT,
  address      text NOT NULL DEFAULT '',
  contact      text NOT NULL DEFAULT '',
  started_on   date,
  comment      text NOT NULL DEFAULT '',
  object_status text NOT NULL DEFAULT 'in_progress'
    CHECK (object_status IN ('in_progress','completed','closed')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. Выполненные работы (начисления; деньги не двигают).
CREATE TABLE IF NOT EXISTS public.finance_work_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  work_date   date NOT NULL DEFAULT CURRENT_DATE,
  title       text NOT NULL CHECK (length(trim(title)) > 0),
  quantity    numeric(14,3) NOT NULL CHECK (quantity > 0),
  unit        text NOT NULL DEFAULT 'шт',
  unit_price  numeric(14,2) NOT NULL CHECK (unit_price >= 0),
  amount      numeric(14,2) GENERATED ALWAYS AS (round(quantity * unit_price, 2)) STORED,
  comment     text NOT NULL DEFAULT '',
  status      text NOT NULL DEFAULT 'counted' CHECK (status IN ('counted','cancelled')),
  version     integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS finance_work_items_project_idx ON public.finance_work_items(project_id);

CREATE TABLE IF NOT EXISTS public.finance_work_item_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_item_id uuid NOT NULL REFERENCES public.finance_work_items(id) ON DELETE RESTRICT,
  version      integer NOT NULL,
  snapshot     jsonb NOT NULL,
  reason       text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (work_item_id, version)
);

-- 3. Распределение приходов/расходов по объектам.
CREATE TABLE IF NOT EXISTS public.finance_operation_allocations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES public.operations(id) ON DELETE RESTRICT,
  project_id   uuid NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
  amount       numeric(14,2) NOT NULL CHECK (amount > 0),
  cost_kind    text CHECK (cost_kind IN ('materials','labor','other')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (operation_id, project_id)
);

-- 4. Связь возврата с исходной операцией/распределением.
CREATE TABLE IF NOT EXISTS public.finance_operation_reversals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reversal_operation_id uuid NOT NULL REFERENCES public.operations(id) ON DELETE RESTRICT,
  source_operation_id   uuid NOT NULL REFERENCES public.operations(id) ON DELETE RESTRICT,
  allocation_id         uuid REFERENCES public.finance_operation_allocations(id) ON DELETE RESTRICT,
  amount                numeric(14,2) NOT NULL CHECK (amount > 0),
  created_at            timestamptz NOT NULL DEFAULT now(),
  CHECK (reversal_operation_id <> source_operation_id)
);

-- 5. Лимиты: распределения ≤ суммы операции; возвраты ≤ распределения/операции.
-- Блокировка строки operations исключает гонку одновременных распределений.
CREATE OR REPLACE FUNCTION public.finance_check_allocation_limit() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE op record; used numeric;
BEGIN
  SELECT * INTO op FROM operations WHERE id = NEW.operation_id FOR UPDATE;
  IF op.operation_type NOT IN ('income','expense') THEN
    RAISE EXCEPTION 'Распределять можно только приход или расход';
  END IF;
  IF op.operation_type = 'income' AND NEW.cost_kind IS NOT NULL THEN
    RAISE EXCEPTION 'Вид затрат указывается только для расхода';
  END IF;
  SELECT coalesce(sum(amount),0) INTO used FROM finance_operation_allocations
   WHERE operation_id = NEW.operation_id AND id <> NEW.id;
  IF used + NEW.amount > op.amount THEN
    RAISE EXCEPTION 'Сумма распределений (%) превышает операцию (%)', used + NEW.amount, op.amount;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS finance_allocation_limit ON public.finance_operation_allocations;
CREATE TRIGGER finance_allocation_limit BEFORE INSERT OR UPDATE ON public.finance_operation_allocations
  FOR EACH ROW EXECUTE FUNCTION public.finance_check_allocation_limit();

CREATE OR REPLACE FUNCTION public.finance_check_reversal_limit() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE src record; rev record; cap numeric; used numeric;
BEGIN
  SELECT * INTO src FROM operations WHERE id = NEW.source_operation_id FOR UPDATE;
  SELECT * INTO rev FROM operations WHERE id = NEW.reversal_operation_id;
  IF rev.operation_type = 'customer_refund' AND src.operation_type <> 'income' THEN
    RAISE EXCEPTION 'Возврат заказчику связывается только с приходом';
  END IF;
  IF rev.operation_type = 'refund' AND src.operation_type <> 'expense' THEN
    RAISE EXCEPTION 'Возврат поставщика связывается только с расходом';
  END IF;
  IF rev.operation_type NOT IN ('customer_refund','refund') THEN
    RAISE EXCEPTION 'Связываемая операция должна быть возвратом';
  END IF;
  IF NEW.allocation_id IS NOT NULL THEN
    SELECT amount INTO cap FROM finance_operation_allocations
     WHERE id = NEW.allocation_id AND operation_id = NEW.source_operation_id FOR UPDATE;
    IF cap IS NULL THEN RAISE EXCEPTION 'Распределение не относится к исходной операции'; END IF;
    SELECT coalesce(sum(amount),0) INTO used FROM finance_operation_reversals
     WHERE allocation_id = NEW.allocation_id AND id <> NEW.id;
  ELSE
    cap := src.amount;
    SELECT coalesce(sum(amount),0) INTO used FROM finance_operation_reversals
     WHERE source_operation_id = NEW.source_operation_id AND id <> NEW.id;
  END IF;
  IF used + NEW.amount > cap THEN
    RAISE EXCEPTION 'Возврат (%) превышает остаток (%)', used + NEW.amount, cap - used;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS finance_reversal_limit ON public.finance_operation_reversals;
CREATE TRIGGER finance_reversal_limit BEFORE INSERT OR UPDATE ON public.finance_operation_reversals
  FOR EACH ROW EXECUTE FUNCTION public.finance_check_reversal_limit();

-- 6. Журнал версий работ: исправление/отмена сохраняют прежнее состояние.
CREATE OR REPLACE FUNCTION public.finance_work_item_history() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF to_jsonb(NEW) - 'updated_at' - 'version' IS DISTINCT FROM to_jsonb(OLD) - 'updated_at' - 'version' THEN
    INSERT INTO finance_work_item_versions(work_item_id, version, snapshot)
    VALUES (OLD.id, OLD.version, to_jsonb(OLD));
    NEW.version := OLD.version + 1;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS finance_work_item_history ON public.finance_work_items;
CREATE TRIGGER finance_work_item_history BEFORE UPDATE ON public.finance_work_items
  FOR EACH ROW EXECUTE FUNCTION public.finance_work_item_history();

CREATE OR REPLACE FUNCTION public.finance_forbid_delete() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Удаление запрещено: используйте отмену'; END $$;
DROP TRIGGER IF EXISTS finance_work_items_no_delete ON public.finance_work_items;
CREATE TRIGGER finance_work_items_no_delete BEFORE DELETE ON public.finance_work_items
  FOR EACH ROW EXECUTE FUNCTION public.finance_forbid_delete();
DROP TRIGGER IF EXISTS finance_work_item_versions_no_delete ON public.finance_work_item_versions;
CREATE TRIGGER finance_work_item_versions_no_delete BEFORE DELETE OR UPDATE ON public.finance_work_item_versions
  FOR EACH ROW EXECUTE FUNCTION public.finance_forbid_delete();

-- 7. Доступ: только сервер сайта (service_role). Анонимного доступа нет.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['finance_object_details','finance_work_items','finance_work_item_versions',
                           'finance_operation_allocations','finance_operation_reversals'] LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

COMMIT;

-- Откат (только если новые таблицы пусты и функции отключены в коде):
-- DROP TABLE public.finance_operation_reversals, public.finance_operation_allocations,
--   public.finance_work_item_versions, public.finance_work_items, public.finance_object_details;
