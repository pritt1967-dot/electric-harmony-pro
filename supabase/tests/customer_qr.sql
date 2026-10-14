-- Проверка постоянного QR заказчика. Всё откатывается: блок завершается исключением CUSTOMER_QR_TESTS_PASSED.
DO $$
declare a1 uuid; a2 uuid; b1 uuid; ca uuid; ca2 uuid; cb uuid; ta uuid; ta2 uuid; tb uuid; j jsonb; denied boolean := false;
begin
  insert into estimates(number, customer_name, phone, email, address) values ('T-1','Тест Иванов','+7 (900) 111-22-33','','ул. А') returning id, customer_id into a1, ca;
  select public_token into ta from customers where id = ca;
  -- новый заказ того же заказчика (другой формат телефона, другой номер)
  insert into estimates(number, customer_name, phone, email, address) values ('T-2','Иванов','8 900 111 22 33','','ул. Б') returning id, customer_id into a2, ca2;
  select public_token into ta2 from customers where id = ca2;
  if ca is null or ca <> ca2 then raise exception 'FAIL: дубликат заказчика'; end if;
  if ta <> ta2 then raise exception 'FAIL: QR изменился после нового заказа'; end if;
  insert into orders(number, estimate_id) values ('T-ORD-1', a1);
  if (select customer_id from orders where number = 'T-ORD-1') <> ca then raise exception 'FAIL: заказ не привязан'; end if;

  j := public_customer_by_token(ta);
  if jsonb_array_length(j->'estimates') <> 2 then raise exception 'FAIL: ожидалось 2 заказа, %', j; end if;

  insert into estimates(number, customer_name, phone, email, address) values ('T-3','Чужой','+7 900 999 00 00','','ул. В') returning id, customer_id into b1, cb;
  select public_token into tb from customers where id = cb;
  j := public_customer_by_token(tb);
  if jsonb_array_length(j->'estimates') <> 1 or (j->'estimates'->0->>'number') <> 'T-3' then raise exception 'FAIL: чужие заказы видны'; end if;
  if public_customer_by_token(gen_random_uuid()) is not null then raise exception 'FAIL: случайный токен'; end if;
  if (public_customer_by_token(ta)::text) like '%900%' then raise exception 'FAIL: раскрыт телефон'; end if;

  set local role anon;
  begin
    perform 1 from customers limit 1;
  exception when insufficient_privilege then denied := true;
  end;
  begin
    perform 1 from estimates limit 1;
  exception when insufficient_privilege then denied := denied and true;
  end;
  reset role;
  if not denied then raise exception 'FAIL: анонимный доступ к заказчикам'; end if;

  raise exception 'CUSTOMER_QR_TESTS_PASSED';
end $$;
