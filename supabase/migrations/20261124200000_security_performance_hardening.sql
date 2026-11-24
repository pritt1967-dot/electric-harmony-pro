-- Security/performance hardening verified against production Supabase.
-- Safe, non-destructive changes:
-- 1) indexes for existing foreign keys;
-- 2) financial summary views honor the caller's RLS;
-- 3) mutable trigger/helper functions use a fixed search_path.

create index if not exists project_videos_project_id_idx
  on public.project_videos(project_id);

create index if not exists order_events_estimate_id_idx
  on public.order_events(estimate_id);

alter view public.project_summary set (security_invoker = true);
alter view public.participant_balances set (security_invoker = true);

alter function public.supabase_keepalive() set search_path = public;
alter function public.sync_operation_participant_ids() set search_path = public;
alter function public.finance_documents_no_delete() set search_path = public;
