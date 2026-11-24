-- Restore public works catalog recovered from the repository history.
-- Do not invent media: only immutable GitHub assets are referenced here.
insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Сборка электрощита','sborka-elektroshchita','Сборка электрощита','','Санкт-Петербург','Санкт-Петербург','Электрощиты','elektroshchity','Сборка электрощита | S&M Electric','Сборка и монтаж электрических щитов S&M Electric.',true,10
where not exists(select 1 from public.projects where slug='sborka-elektroshchita');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Монтаж электропроводки','montazh-elektroprovodki','Монтаж электропроводки','','Санкт-Петербург','Санкт-Петербург','Электромонтажные работы','elektromontazh','Монтаж электропроводки | S&M Electric','Электромонтаж и прокладка электропроводки S&M Electric.',true,20
where not exists(select 1 from public.projects where slug='montazh-elektroprovodki');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Монтаж освещения','montazh-osveshcheniya','Монтаж освещения','','Санкт-Петербург','Санкт-Петербург','Освещение','osveshchenie','Монтаж освещения | S&M Electric','Монтаж освещения S&M Electric.',true,30
where not exists(select 1 from public.projects where slug='montazh-osveshcheniya');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Зарядные станции для электромобилей','zaryadnye-stancii-dlya-elektromobiley','Зарядные станции для электромобилей','','Санкт-Петербург','Санкт-Петербург','Зарядные станции','zaryadnye-stancii','Зарядные станции для электромобилей | S&M Electric','Монтаж зарядных станций для электромобилей S&M Electric.',true,40
where not exists(select 1 from public.projects where slug='zaryadnye-stancii-dlya-elektromobiley');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Подключение заземления','podklyuchenie-zazemleniya','Подключение заземления','','Ленинградская область','Ленинградская область','Заземление','zazemlenie','Подключение заземления | S&M Electric','Монтаж и подключение заземления S&M Electric.',true,50
where not exists(select 1 from public.projects where slug='podklyuchenie-zazemleniya');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Частный дом','chastnyy-dom','Частный дом','','Ленинградская область','Ленинградская область','Электромонтажные работы','elektromontazh','Электромонтаж в частном доме | S&M Electric','Электромонтажные работы в частном доме S&M Electric.',true,60
where not exists(select 1 from public.projects where slug='chastnyy-dom');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Электромонтажные работы на секретном объекте','elektromontazhnye-raboty-na-sekretnom-obekte','Электромонтажные работы на секретном объекте','','Санкт-Петербург','Санкт-Петербург','Электромонтажные работы','elektromontazh','Электромонтажные работы на секретном объекте | S&M Electric','Электромонтажные работы S&M Electric.',true,70
where not exists(select 1 from public.projects where slug='elektromontazhnye-raboty-na-sekretnom-obekte');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Монтаж СИП от опоры до дома','montazh-sip-ot-opory-do-doma','Монтаж СИП от опоры до дома','','Ленинградская область','Ленинградская область','Кабельные линии','kabelnye-linii','Монтаж СИП от опоры до дома | S&M Electric','Монтаж СИП от опоры до дома S&M Electric.',true,80
where not exists(select 1 from public.projects where slug='montazh-sip-ot-opory-do-doma');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Электромонтаж в деревянном доме — ретропроводка','elektromontazh-v-derevyannom-dome-retroprovodka','Электромонтаж в деревянном доме — ретропроводка','','Ленинградская область','Ленинградская область','Электромонтажные работы','elektromontazh','Электромонтаж в деревянном доме — ретропроводка | S&M Electric','Электромонтаж и ретропроводка в деревянном доме S&M Electric.',true,90
where not exists(select 1 from public.projects where slug='elektromontazh-v-derevyannom-dome-retroprovodka');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,task,works_done,equipment,result_text,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Заземление, разделение PEN и замена щита на опоре','zazemlenie-razdelenie-pen-zamena-shchita-na-opore','Заземление, разделение PEN и замена щита на опоре',
'Выполнен комплекс электромонтажных работ: устройство заземления; разделение PEN-проводника на PE и N; замена электрического щита на опоре; подключение защитного заземления; монтаж и подключение оборудования; проведение электрических измерений; измеренное сопротивление заземляющего устройства — 2,5 Ом.',
'Ленинградская область','Ленинградская область','Заземление',
'Устройство заземления; разделение PEN-проводника на PE и N; замена электрического щита на опоре; подключение защитного заземления; монтаж и подключение оборудования; электрические измерения.',
'','','Измеренное сопротивление заземляющего устройства — 2,5 Ом.','zazemlenie',
'Заземление, разделение PEN и замена щита на опоре | S&M Electric',
'Устройство заземления, разделение PEN на PE и N, замена щита на опоре и электрические измерения. S&M Electric.',true,100
where not exists(select 1 from public.projects where slug='zazemlenie-razdelenie-pen-zamena-shchita-na-opore');

insert into public.projects
(customer_name,project_name,slug,title,description,location,city,category,service_slug,seo_title,seo_description,is_published,sort_order)
select '','Модульное заземление и подготовка подключения зарядной станции','modulnoe-zazemlenie-podgotovka-zaryadnoj-stancii','Модульное заземление и подготовка подключения зарядной станции','','Ленинградская область','Ленинградская область','Заземление','zazemlenie','Модульное заземление и подготовка подключения зарядной станции | S&M Electric','Модульное заземление и подготовка подключения зарядной станции S&M Electric.',true,110
where not exists(select 1 from public.projects where slug='modulnoe-zazemlenie-podgotovka-zaryadnoj-stancii');

insert into public.project_images(project_id,image_url,storage_path,caption,alt,sort_order)
select p.id,v.url,'',v.caption,v.alt,v.n
from public.projects p
join (values
('sborka-elektroshchita','https://raw.githubusercontent.com/pritt1967-dot/electric-harmony-pro/e3c55bc943415f17d1183f39f61c1a656ba42c2b/src/assets/work-panel.jpg','Электрощит','Сборка электрощита',0),
('montazh-elektroprovodki','https://raw.githubusercontent.com/pritt1967-dot/electric-harmony-pro/e3c55bc943415f17d1183f39f61c1a656ba42c2b/src/assets/work-wiring.jpg','Электропроводка','Монтаж электропроводки',0),
('montazh-osveshcheniya','https://raw.githubusercontent.com/pritt1967-dot/electric-harmony-pro/e3c55bc943415f17d1183f39f61c1a656ba42c2b/src/assets/work-lighting.jpg','Освещение','Монтаж освещения',0),
('zaryadnye-stancii-dlya-elektromobiley','https://raw.githubusercontent.com/pritt1967-dot/electric-harmony-pro/e3c55bc943415f17d1183f39f61c1a656ba42c2b/src/assets/work-ev-charger.jpg','Зарядная станция','Зарядная станция для электромобиля',0),
('zaryadnye-stancii-dlya-elektromobiley','https://raw.githubusercontent.com/pritt1967-dot/electric-harmony-pro/e3c55bc943415f17d1183f39f61c1a656ba42c2b/src/assets/work-ev-tesla.jpg','Зарядная станция Tesla','Зарядная станция Tesla',1)
) v(slug,url,caption,alt,n) on p.slug=v.slug
where not exists(select 1 from public.project_images i where i.project_id=p.id and i.image_url=v.url);

update public.projects p
set cover_image=i.image_url
from public.project_images i
where i.project_id=p.id and i.sort_order=0 and coalesce(p.cover_image,'')='';
