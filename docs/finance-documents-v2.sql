-- Выполнить один раз в ФИНАНСОВОЙ базе (SQL Editor) после docs/finance-documents.sql.
-- Только добавляет поля; существующие строки, операции, суммы и балансы не меняются.
alter table public.finance_documents
  add column if not exists key_version text not null default 'v1',
  add column if not exists qr_fingerprint text;
comment on column public.finance_documents.key_version is 'Версия серверного ключа подписи (v1 — прежний, v2 — текущий)';
comment on column public.finance_documents.qr_fingerprint is 'SHA-256 метки из QR-ссылки; сама метка не хранится';
comment on column public.finance_documents.signature is 'HMAC-SHA256 записи ключом версии key_version';
create index if not exists finance_documents_key_version_idx on public.finance_documents (key_version);
