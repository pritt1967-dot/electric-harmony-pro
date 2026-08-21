
create or replace function public.public_estimate_by_token(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare e record; o record;
begin
  select * into e from public.estimates where public_token = p_token;
  if not found then return null; end if;
  select * into o from public.orders where estimate_id = e.id limit 1;
  return jsonb_build_object(
    'estimate', to_jsonb(e) - 'approved_ip' - 'approved_session',
    'order', case when o.id is null then null else jsonb_build_object(
      'number', coalesce(o.number,''),
      'status', coalesce(o.status,'new'),
      'payment_status', coalesce(o.payment_status,'unpaid'),
      'paid_amount', coalesce(o.paid_amount,0)
    ) end
  );
end $$;

create or replace function public.approve_public_estimate(
  p_token uuid, p_name text default '', p_session text default '', p_ip text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare e record; o record; v_snapshot jsonb; v_at timestamptz := now(); v_num text; v_seq int;
begin
  select * into e from public.estimates where public_token = p_token;
  if not found then raise exception 'Смета не найдена'; end if;
  if e.approved_at is not null then
    return public.public_estimate_by_token(p_token);
  end if;

  v_snapshot := jsonb_build_object(
    'items', e.items, 'total', e.total, 'discount_type', e.discount_type,
    'discount_value', e.discount_value, 'version', coalesce(e.version,1),
    'approved_by_name', coalesce(p_name,''), 'frozen_at', v_at
  );

  update public.estimates set
    status = 'approved', approved_at = v_at, approved_by_name = coalesce(p_name,''),
    approved_ip = coalesce(p_ip,''), approved_session = coalesce(p_session,''),
    approved_snapshot = v_snapshot
  where id = e.id;

  select coalesce(max((regexp_match(number, 'ORD-\d{4}-(\d+)'))[1]::int), 0) + 1
    into v_seq from public.orders
    where number like 'ORD-' || to_char(v_at,'YYYY') || '-%';
  v_num := 'ORD-' || to_char(v_at,'YYYY') || '-' || lpad(v_seq::text, 5, '0');

  insert into public.orders (
    number, estimate_id, estimate_number, customer_name, address, object_name,
    phone, email, items, total, approved_at, estimate_version, approved_snapshot,
    status, payment_status
  ) values (
    v_num, e.id, e.number, e.customer_name, e.address, coalesce(e.object_name,''),
    coalesce(e.phone,''), coalesce(e.email,''), e.items, e.total, v_at,
    coalesce(e.version,1), v_snapshot, 'approved', 'unpaid'
  ) returning * into o;

  insert into public.order_events (order_id, estimate_id, kind, message, to_status, actor, meta)
  values
    (o.id, e.id, 'approved',
     'Заказчик согласовал смету № ' || e.number || ' (версия ' || coalesce(e.version,1) || ')' ||
       case when coalesce(p_name,'') <> '' then ', имя: ' || p_name else '' end,
     'approved', 'customer',
     jsonb_build_object('ip', coalesce(p_ip,''), 'session', coalesce(p_session,''), 'total', e.total)),
    (o.id, e.id, 'order_created',
     'Создан заказ № ' || v_num || ' на основании согласованной сметы',
     'approved', 'system', '{}'::jsonb);

  return public.public_estimate_by_token(p_token);
end $$;

create or replace function public.request_public_order_payment(p_token uuid, p_kind text default 'full')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare e record; o record; v_amount numeric; v_percent numeric;
begin
  select * into e from public.estimates where public_token = p_token;
  if not found or e.approved_at is null then raise exception 'Смета не согласована'; end if;
  select * into o from public.orders where estimate_id = e.id limit 1;
  if o.id is null then raise exception 'Заказ не найден'; end if;

  v_percent := coalesce(nullif(o.prepayment_percent, 0), 30);
  v_amount := case p_kind
    when 'prepay' then round(o.total * v_percent / 100, 2)
    when 'rest' then greatest(o.total - coalesce(o.paid_amount,0), 0)
    else o.total end;

  update public.orders set payment_status = 'awaiting', status = 'awaiting_payment' where id = o.id;

  insert into public.order_events (order_id, estimate_id, kind, message, from_status, to_status, actor, meta)
  values (o.id, e.id, 'payment_requested',
    'Заказчик запросил оплату на сумму ' || v_amount::text || ' ₽',
    coalesce(o.status,''), 'awaiting_payment', 'customer',
    jsonb_build_object('amount', v_amount, 'kind', p_kind));

  return jsonb_build_object('ok', true, 'amount', v_amount, 'order_number', o.number);
end $$;

revoke all on function public.public_estimate_by_token(uuid) from public;
revoke all on function public.approve_public_estimate(uuid, text, text, text) from public;
revoke all on function public.request_public_order_payment(uuid, text) from public;
grant execute on function public.public_estimate_by_token(uuid) to anon, authenticated, service_role;
grant execute on function public.approve_public_estimate(uuid, text, text, text) to anon, authenticated, service_role;
grant execute on function public.request_public_order_payment(uuid, text) to anon, authenticated, service_role;
