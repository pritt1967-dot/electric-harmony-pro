REVOKE EXECUTE ON FUNCTION public.snapshot_estimate_version() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lock_approved_estimate() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;