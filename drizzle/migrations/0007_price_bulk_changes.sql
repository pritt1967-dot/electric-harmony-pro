CREATE TABLE public.price_change_batches (
 id uuid PRIMARY KEY,
 created_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 direction text NOT NULL CHECK (direction IN ('increase','decrease')),
 percent numeric NOT NULL CHECK (percent > 0),
 scope text NOT NULL CHECK (scope IN ('all','selected','category')),
 category text NOT NULL DEFAULT '',
 items jsonb NOT NULL,
 backup jsonb NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','applied','restored')),
 applied_at timestamptz,
 restored_at timestamptz
);
GRANT SELECT ON public.price_change_batches TO authenticated;
GRANT ALL ON public.price_change_batches TO service_role;
ALTER TABLE public.price_change_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read price backups" ON public.price_change_batches FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE FUNCTION public.preview_price_change(p_id uuid, p_direction text, p_percent numeric, p_scope text, p_category text DEFAULT '', p_ids uuid[] DEFAULT '{}') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b public.price_change_batches; v_items jsonb; v_backup jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Нет прав на изменение прайса'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 SELECT * INTO b FROM public.price_change_batches WHERE id=p_id;
 IF FOUND THEN
  IF b.created_by <> auth.uid() OR b.direction <> p_direction OR b.percent <> p_percent OR b.scope <> p_scope OR b.category <> coalesce(p_category,'') THEN RAISE EXCEPTION 'Операция уже существует с другими параметрами'; END IF;
  RETURN to_jsonb(b) - 'backup';
 END IF;
 IF p_direction NOT IN ('increase','decrease') OR p_scope NOT IN ('all','selected','category') OR p_percent IS NULL OR p_percent::text IN ('NaN','Infinity','-Infinity') OR p_percent <= 0 OR (p_direction='decrease' AND p_percent > 100) THEN RAISE EXCEPTION 'Введите положительный процент; уменьшение не более 100%%'; END IF;
 IF p_scope='selected' AND coalesce(cardinality(p_ids),0)=0 THEN RAISE EXCEPTION 'Выберите позиции'; END IF;
 IF p_scope='category' AND coalesce(p_category,'')='' THEN RAISE EXCEPTION 'Выберите категорию'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.id),'[]') INTO v_backup FROM public.price_items p;
 SELECT jsonb_agg(jsonb_build_object('id',p.id,'name',p.name,'old_price',p.price,'new_price',round(p.price*(1+CASE WHEN p_direction='increase' THEN p_percent ELSE -p_percent END/100)), 'updated_at',p.updated_at) ORDER BY p.category,p.name,p.id)
 INTO v_items FROM public.price_items p WHERE p_scope='all' OR (p_scope='selected' AND p.id=ANY(p_ids)) OR (p_scope='category' AND p.category=p_category);
 IF v_items IS NULL THEN RAISE EXCEPTION 'Нет позиций для изменения'; END IF;
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(v_items) i WHERE (i->>'old_price')::numeric < 0 OR (i->>'new_price')::numeric < 0 OR (i->>'new_price')::numeric > 9999999999.99) THEN RAISE EXCEPTION 'Цена вне допустимого диапазона'; END IF;
 INSERT INTO public.price_change_batches(id,created_by,direction,percent,scope,category,items,backup) VALUES(p_id,auth.uid(),p_direction,p_percent,p_scope,coalesce(p_category,''),v_items,v_backup) RETURNING * INTO b;
 RETURN to_jsonb(b) - 'backup';
END $$;

CREATE FUNCTION public.apply_price_change(p_id uuid, p_restore boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b public.price_change_batches; v_count integer; v_expected integer; v_at timestamptz := now();
BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Нет прав на изменение прайса'; END IF;
 LOCK TABLE public.price_items IN SHARE ROW EXCLUSIVE MODE;
 SELECT * INTO b FROM public.price_change_batches WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Операция не найдена'; END IF;
 IF (NOT p_restore AND b.status='applied') OR (p_restore AND b.status='restored') THEN RETURN to_jsonb(b)-'backup'; END IF;
 IF (NOT p_restore AND b.status <> 'pending') OR (p_restore AND b.status <> 'applied') THEN RAISE EXCEPTION 'Операция уже завершена'; END IF;
 v_expected := jsonb_array_length(b.items);
 SELECT count(*) INTO v_count FROM jsonb_array_elements(b.items) i JOIN public.price_items p ON p.id=(i->>'id')::uuid
 WHERE p.price=CASE WHEN p_restore THEN (i->>'new_price')::numeric ELSE (i->>'old_price')::numeric END
 AND p.updated_at=CASE WHEN p_restore THEN b.applied_at ELSE (i->>'updated_at')::timestamptz END;
 IF v_count <> v_expected THEN RAISE EXCEPTION 'Прайс изменился после просмотра. Обновите предварительный просмотр; восстановление не перезаписывает последующие правки'; END IF;
 UPDATE public.price_items p SET price=CASE WHEN p_restore THEN (i->>'old_price')::numeric ELSE (i->>'new_price')::numeric END
 FROM jsonb_array_elements(b.items) i WHERE p.id=(i->>'id')::uuid;
 UPDATE public.price_change_batches SET status=CASE WHEN p_restore THEN 'restored' ELSE 'applied' END,
 applied_at=CASE WHEN p_restore THEN applied_at ELSE v_at END, restored_at=CASE WHEN p_restore THEN v_at ELSE NULL END WHERE id=p_id RETURNING * INTO b;
 RETURN to_jsonb(b)-'backup';
END $$;
REVOKE ALL ON FUNCTION public.preview_price_change(uuid,text,numeric,text,text,uuid[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.apply_price_change(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.preview_price_change(uuid,text,numeric,text,text,uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_price_change(uuid,boolean) TO authenticated;