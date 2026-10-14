-- Проверка постоянного QR заказчика. Всё откатывается: успешный итог — исключение CUSTOMER_QR_TESTS_PASSED.
DO $$
declare a1 uuid; a2 uuid; b1 uuid; ca uuid; ca2 uuid; cb uuid; ta uuid; ta2 uuid; tb uuid; j jsonb; denied boolean := false; n int;
begin
  insert into estimates(number, customer_name, phone, email, address) values ('T-1','Тест Иванов','+7 (900) 111-22-33','','ул. А') returning id, customer_id into a1, ca;
  select public_token into ta from customers where id = ca;
  insert into estimates(number, customer_name, phone, email, address) values ('T-2','Иванов','8 900 111 22 33','','ул. Б') returning id, customer_id into a2, ca2;
  select public_token into ta2 from customers where id = ca2;
  if ca is null or ca <> ca2 then raise exception 'FAIL: дубликат заказчика'; end if;
  if ta <> ta2 then raise exception 'FAIL: QR изменился'; end if;
  insert into orders(number, estimate_id) values ('T-ORD-1', a1);
  if (select customer_id from orders where number = 'T-ORD-1') <> ca then raise exception 'FAIL: заказ не привязан'; end if;
  j := public_customer_by_token(ta);
  if jsonb_array_length(j->'estimates') <> 2 then raise exception 'FAIL: 2 заказа'; end if;
  insert into estimates(number, customer_name, phone, email, address) values ('T-3','Чужой','+7 900 999 00 00','','ул. В') returning id, customer_id into b1, cb;
  select public_token into tb from customers where id = cb;
  j := public_customer_by_token(tb);
  if jsonb_array_length(j->'estimates') <> 1 or (j->'estimates'->0->>'number') <> 'T-3' then raise exception 'FAIL: чужие заказы видны'; end if;
  if public_customer_by_token(gen_random_uuid()) is not null then raise exception 'FAIL: случайный токен'; end if;
  if (public_customer_by_token(ta)::text) like '%900%' then raise exception 'FAIL: раскрыт телефон'; end if;
  set local role anon;
  begin perform 1 from customers limit 1; exception when insufficient_privilege then denied := true; end;
  reset role;
  if not denied then raise exception 'FAIL: анонимный доступ'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', gen_random_uuid(), 'role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from customers;
  if n <> 0 then reset role; raise exception 'FAIL: чужой пользователь видит заказчиков'; end if;
  select count(*) into n from orders;
  reset role;
  if n <> 0 then raise exception 'FAIL: чужой пользователь видит заказы'; end if;
  raise exception 'CUSTOMER_QR_TESTS_PASSED';
end $$;
