import asyncio,json,os,uuid
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/bulk-prices')
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True)
  ctx=await browser.new_context(viewport={'width':1280,'height':1800})
  page=await ctx.new_page()
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[os.environ['LOVABLE_BROWSER_SUPABASE_STORAGE_KEY'],os.environ['LOVABLE_BROWSER_SUPABASE_SESSION_JSON']])
  await page.goto('http://localhost:8080/admin')
  await page.get_by_role('tab',name='Прайс',exact=True).click()
  await page.get_by_label('Процент, %').wait_for()
  async def db(path,method='GET',body=None):
   return await page.evaluate('''async ({path,method,body,key})=>{
    const session=JSON.parse(localStorage.getItem(key));
    const r=await fetch('/api/public/sb/rest/v1/'+path,{method,headers:{Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
    return {status:r.status,body:await r.json()};
   }''',{'path':path,'method':method,'body':body,'key':os.environ['LOVABLE_BROWSER_SUPABASE_STORAGE_KEY']})
  initial=await db('price_items?select=*&order=id')
  assert initial['status']==200
  (OUT/'original-prices.json').write_text(json.dumps(initial['body']))
  item=next(i for i in initial['body'] if i['is_public'] and i['in_calculator'] and i['price']>0)
  pending=[]
  async def restore(batch):
   result=await db('rpc/apply_price_change','POST',{'p_id':batch,'p_restore':True})
   assert result['status']==200,result
   pending.remove(batch)
  try:
   # Category scope preview is checked without changing a category's live prices.
   cat=str(item['category'])
   r=await db('rpc/preview_price_change','POST',{'p_id':str(uuid.uuid4()),'p_direction':'increase','p_percent':10,'p_scope':'category','p_category':cat})
   assert r['status']==200
   assert set(i['id'] for i in r['body']['items'])==set(i['id'] for i in initial['body'] if i['category']==cat)
   print('CATEGORY_MATCH',len(r['body']['items']))
   # UI decrease on a real published/calculator position, immediately reverted.
   await page.get_by_role('checkbox',name='Выбрать: '+item['name'],exact=True).check()
   await page.get_by_label('Область применения',exact=True).click()
   await page.get_by_role('option',name='Только выбранные',exact=False).click()
   await page.get_by_label('Процент, %').fill('10')
   await page.get_by_role('button',name='Уменьшить цены',exact=True).click()
   dialog=page.get_by_role('dialog')
   await dialog.get_by_role('table').wait_for()
   assert await dialog.locator('tbody tr').count()==1
   new=int(float(item['price'])*.9+.5)
   await dialog.get_by_role('button',name='Подтвердить изменение',exact=True).click()
   await page.get_by_text('Цены сохранены: 1 позиций',exact=True).wait_for()
   batches=await db('price_change_batches?select=id,status&status=eq.applied&order=created_at.desc&limit=1')
   batch=batches['body'][0]['id']; pending.append(batch)
   repeat=await db('rpc/apply_price_change','POST',{'p_id':batch})
   assert repeat['status']==200
   actual=await db('price_items?select=price&id=eq.'+item['id'])
   assert actual['body'][0]['price']==new
   print('DECREASE_AND_REPEAT',item['price'],new)
   public=await ctx.new_page(); await public.goto('http://localhost:8080/prices')
   article=public.get_by_role('article').filter(has=public.get_by_role('heading',name=item['name'],exact=True))
   await article.wait_for()
   text=await article.inner_text()
   assert str(new) in text.replace('\u00a0','').replace('\u202f','').replace(' ','')
   await article.screenshot(path=str(OUT/'public-new-price.png'))
   await article.get_by_role('button',name='Добавить в расчёт',exact=True).click()
   calc=public.locator('#calc')
   await article.get_by_role('button',name='В расчёте: 1',exact=False).wait_for()
   assert str(new) in (await calc.inner_text()).replace('\u00a0','').replace('\u202f','').replace(' ','')
   await calc.screenshot(path=str(OUT/'calculator-new-price.png'))
   print('PUBLIC_AND_CALCULATOR_CONFIRMED')
   await public.close()
   await restore(batch)
   # Stale preview rejected after another operation, which is then restored.
   def params(id): return {'p_id':id,'p_direction':'increase','p_percent':10,'p_scope':'selected','p_ids':[item['id']]}
   stale=str(uuid.uuid4()); fresh=str(uuid.uuid4())
   assert (await db('rpc/preview_price_change','POST',params(stale)))['status']==200
   assert (await db('rpc/preview_price_change','POST',params(fresh)))['status']==200
   assert (await db('rpc/apply_price_change','POST',{'p_id':fresh}))['status']==200
   pending.append(fresh)
   rejected=await db('rpc/apply_price_change','POST',{'p_id':stale})
   assert rejected['status']>=400
   print('STALE_PREVIEW_REJECTED')
   await restore(fresh)
  finally:
   for batch in list(reversed(pending)): await restore(batch)
  final=await db('price_items?select=*&order=id')
  def unchanged(row): return {k:v for k,v in row.items() if k!='updated_at'}
  assert [unchanged(r) for r in initial['body']]==[unchanged(r) for r in final['body']]
  print('ALL_190_ROWS_VALUES_UNCHANGED_AFTER_RESTORE')
  anon=await ctx.request.post('http://localhost:8080/api/public/sb/rest/v1/rpc/apply_price_change',data={'p_id':str(uuid.uuid4())})
  assert anon.status>=400
  print('ANONYMOUS_WRITE_REJECTED',anon.status)
  await browser.close()
asyncio.run(main())
