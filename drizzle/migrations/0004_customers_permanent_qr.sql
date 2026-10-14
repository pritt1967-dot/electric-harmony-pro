CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  phone_norm text NOT NULL DEFAULT '',
  email_norm text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage customers" ON public.customers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE UNIQUE INDEX customers_phone_uq ON public.customers(phone_norm) WHERE phone_norm <> '';
CREATE UNIQUE INDEX customers_email_uq ON public.customers(email_norm) WHERE email_norm <> '' AND phone_norm = '';

ALTER TABLE public.estimates ADD COLUMN customer_id uuid REFERENCES public.customers(id);
ALTER TABLE public.orders ADD COLUMN customer_id uuid REFERENCES public.customers(id);
CREATE INDEX estimates_customer_idx ON public.estimates(customer_id);
CREATE INDEX orders_customer_idx ON public.orders(customer_id);

CREATE OR REPLACE FUNCTION public.normalize_phone(p text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  select case when length(d) = 11 and left(d,1) in ('7','8') then '7'||substr(d,2)
              when length(d) = 10 then '7'||d
              else d end
  from (select regexp_replace(coalesce(p,''),'\D','','g') d) s
$$;

-- Один заказчик на телефон (иначе e-mail, иначе имя+адрес); номер сметы/заказа не участвует.
CREATE OR REPLACE FUNCTION public.resolve_customer(p_name text, p_phone text, p_email text, p_address text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
declare v_phone text := public.normalize_phone(p_phone);
        v_email text := lower(trim(coalesce(p_email,'')));
        v_name text := trim(coalesce(p_name,''));
        v_id uuid;
begin
  if v_phone <> '' then
    select id into v_id from customers where phone_norm = v_phone;
  elsif v_email <> '' then
    select id into v_id from customers where email_norm = v_email and phone_norm = '';
  elsif v_name <> '' then
    select e.customer_id into v_id from estimates e
     where e.customer_id is not null and coalesce(e.phone,'') = '' and coalesce(e.email,'') = ''
       and lower(trim(e.customer_name)) = lower(v_name)
       and lower(trim(e.address)) = lower(trim(coalesce(p_address,''))) limit 1;
  else
    return null;
  end if;
  if v_id is null then
    insert into customers(name, phone_norm, email_norm) values (v_name, v_phone, case when v_phone = '' then v_email else '' end)
    on conflict do nothing returning id into v_id;
    if v_id is null then
      select id into v_id from customers where (v_phone <> '' and phone_norm = v_phone) or (v_phone = '' and email_norm = v_email and phone_norm = '');
    end if;
  end if;
  return v_id;
end $$;
REVOKE EXECUTE ON FUNCTION public.resolve_customer(text,text,text,text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.estimate_assign_customer() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if new.customer_id is null then
    new.customer_id := public.resolve_customer(new.customer_name, new.phone, new.email, new.address);
  end if;
  return new;
end $$;
CREATE TRIGGER estimates_assign_customer BEFORE INSERT OR UPDATE OF customer_name, phone, email, address, customer_id ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.estimate_assign_customer();

CREATE OR REPLACE FUNCTION public.order_assign_customer() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
begin
  if new.customer_id is null and new.estimate_id is not null then
    select customer_id into new.customer_id from estimates where id = new.estimate_id;
  end if;
  if new.customer_id is null then
    new.customer_id := public.resolve_customer(new.customer_name, new.phone, new.email, new.address);
  end if;
  return new;
end $$;
CREATE TRIGGER orders_assign_customer BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.order_assign_customer();

-- Публичный кабинет по постоянному QR: только сметы/заказы этого заказчика, без контактов.
CREATE OR REPLACE FUNCTION public.public_customer_by_token(p_token uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
declare c record;
begin
  select * into c from customers where public_token = p_token;
  if not found then return null; end if;
  return jsonb_build_object(
    'name', c.name,
    'estimates', coalesce((select jsonb_agg(jsonb_build_object(
        'token', e.public_token, 'number', e.number, 'doc_date', e.doc_date,
        'object_name', e.object_name, 'address', e.address, 'total', e.total,
        'status', e.status, 'version', e.version, 'approved_at', e.approved_at,
        'order', (select jsonb_build_object('number', o.number, 'status', o.status,
                  'payment_status', o.payment_status, 'paid_amount', o.paid_amount)
                  from orders o where o.estimate_id = e.id limit 1)
      ) order by e.created_at desc) from estimates e where e.customer_id = c.id), '[]'::jsonb)
  );
end $$;
GRANT EXECUTE ON FUNCTION public.public_customer_by_token(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.estimate_customer_token(p_estimate_token uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select c.public_token from estimates e join customers c on c.id = e.customer_id where e.public_token = p_estimate_token
$$;
GRANT EXECUTE ON FUNCTION public.estimate_customer_token(uuid) TO anon, authenticated;

UPDATE public.estimates SET customer_id = public.resolve_customer(customer_name, phone, email, address) WHERE customer_id IS NULL;
UPDATE public.orders o SET customer_id = e.customer_id FROM public.estimates e WHERE o.estimate_id = e.id AND o.customer_id IS NULL;