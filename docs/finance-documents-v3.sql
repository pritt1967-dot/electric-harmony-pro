-- Выполнить один раз в ФИНАНСОВОЙ базе после finance-documents-v2.sql.
-- Только добавляет поля и защиту от перезаписи; операции, суммы и балансы не меняются.
alter table public.finance_documents
  add column if not exists pdf_sha256 text,
  add column if not exists pdf_signature text,
  add column if not exists pdf_registered_at timestamptz;
comment on column public.finance_documents.pdf_sha256 is 'SHA-256 выданного PDF-файла, фиксируется один раз';
grant update (pdf_sha256, pdf_signature, pdf_registered_at) on public.finance_documents to service_role;

create or replace function public.finance_documents_immutable() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.id is distinct from old.id or new.doc_type is distinct from old.doc_type
     or new.project_id is distinct from old.project_id or new.issued_at is distinct from old.issued_at
     or new.fingerprint is distinct from old.fingerprint or new.signature is distinct from old.signature
     or new.format_version is distinct from old.format_version or new.operation_ids is distinct from old.operation_ids
     or new.key_version is distinct from old.key_version or new.qr_fingerprint is distinct from old.qr_fingerprint then
    raise exception 'Зафиксированная версия документа не может быть изменена';
  end if;
  if old.pdf_sha256 is not null and (new.pdf_sha256 is distinct from old.pdf_sha256
     or new.pdf_signature is distinct from old.pdf_signature or new.pdf_registered_at is distinct from old.pdf_registered_at) then
    raise exception 'Отпечаток PDF уже зафиксирован';
  end if;
  return new;
end $$;
drop trigger if exists finance_documents_immutable on public.finance_documents;
create trigger finance_documents_immutable before update on public.finance_documents
  for each row execute function public.finance_documents_immutable();

create or replace function public.finance_documents_no_delete() returns trigger
language plpgsql as $$ begin raise exception 'Финансовые документы не удаляются'; end $$;
drop trigger if exists finance_documents_no_delete on public.finance_documents;
create trigger finance_documents_no_delete before delete on public.finance_documents
  for each row execute function public.finance_documents_no_delete();
