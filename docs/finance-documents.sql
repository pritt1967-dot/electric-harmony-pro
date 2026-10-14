-- Выполнить один раз в ФИНАНСОВОЙ базе (SQL Editor). Существующие таблицы не меняются.
create table if not exists public.finance_documents (
  id text primary key,
  doc_type text not null,
  project_id text not null,
  issued_at timestamptz not null default now(),
  fingerprint text not null,
  signature text not null,
  format_version integer not null default 1,
  operation_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);
revoke all on public.finance_documents from anon, authenticated;
grant select, insert on public.finance_documents to service_role;
alter table public.finance_documents enable row level security;
create index if not exists finance_documents_project_idx on public.finance_documents (project_id);
