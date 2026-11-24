-- Compatibility schema for the independent SM Electric production build.
-- Applied to Supabase production as migration: restore_public_site_api_compatibility

create table if not exists public.project_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  video_url text not null default '',
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.project_videos enable row level security;

drop policy if exists "Public project videos" on public.project_videos;
create policy "Public project videos"
on public.project_videos for select
to anon, authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_videos.project_id and p.is_published = true
  )
);

drop policy if exists "Admins manage project videos" on public.project_videos;
create policy "Admins manage project videos"
on public.project_videos for all
to authenticated
using (has_role(auth.uid(), 'admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role));

grant select on public.project_videos to anon, authenticated;
grant insert, update, delete on public.project_videos to authenticated;

create table if not exists public.client_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  photo_path text not null default '',
  status text not null default 'pending' check (status in ('pending','published','rejected')),
  consent boolean not null default false,
  ip_hash text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_reviews_status_published_at_idx
on public.client_reviews(status, published_at desc);

create index if not exists client_reviews_ip_created_at_idx
on public.client_reviews(ip_hash, created_at desc);

alter table public.client_reviews enable row level security;

drop policy if exists "Published client reviews are public" on public.client_reviews;
create policy "Published client reviews are public"
on public.client_reviews for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can submit pending reviews" on public.client_reviews;
create policy "Public can submit pending reviews"
on public.client_reviews for insert
to anon, authenticated
with check (status = 'pending' and consent = true);

drop policy if exists "Admins manage client reviews" on public.client_reviews;
create policy "Admins manage client reviews"
on public.client_reviews for all
to authenticated
using (has_role(auth.uid(), 'admin'::app_role))
with check (has_role(auth.uid(), 'admin'::app_role));

grant select on public.client_reviews to anon, authenticated;
grant insert on public.client_reviews to anon, authenticated;
grant update, delete on public.client_reviews to authenticated;

create or replace function public.published_client_reviews()
returns table (
  id uuid,
  name text,
  location text,
  rating integer,
  text text,
  photo_path text,
  published_at timestamptz
)
language sql
stable
set search_path = public
as $$
  select r.id, r.name, r.location, r.rating, r.text, r.photo_path, r.published_at
  from public.client_reviews r
  where r.status = 'published'
  order by r.published_at desc nulls last, r.created_at desc
  limit 100;
$$;

create or replace function public.client_review_recent_count(_ip_hash text)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.client_reviews r
  where r.ip_hash = _ip_hash
    and r.created_at >= now() - interval '1 hour';
$$;

grant execute on function public.published_client_reviews() to anon, authenticated;
grant execute on function public.client_review_recent_count(text) to anon, authenticated;

notify pgrst, 'reload schema';
