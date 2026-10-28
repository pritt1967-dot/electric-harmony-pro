-- Read-only metadata report for the SEPARATE finance database.
-- Run using a database owner connection; do not substitute the site database.
-- This script contains no data reads or writes and creates no database objects.
BEGIN TRANSACTION READ ONLY;

SELECT table_name, ordinal_position, column_name, data_type, udt_schema,
       udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('projects','operations','participants','project_participants','categories','finance_documents')
ORDER BY table_name, ordinal_position;

SELECT c.relname AS table_name, con.conname, con.contype,
       pg_get_constraintdef(con.oid, true) AS definition, con.convalidated
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND (c.relname IN ('projects','operations','participants','project_participants','categories','finance_documents')
       OR con.confrelid IN (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace
          AND relname IN ('projects','operations','participants','project_participants','categories','finance_documents')))
ORDER BY c.relname, con.conname;

SELECT c.table_name, c.column_name, t.typname AS enum_name, e.enumlabel
FROM information_schema.columns c
JOIN pg_type t ON t.typname = c.udt_name AND t.typnamespace = to_regnamespace(c.udt_schema)
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE c.table_schema = 'public'
  AND c.table_name IN ('projects','operations','participants','project_participants','categories','finance_documents')
ORDER BY c.table_name, c.column_name, e.enumsortorder;

SELECT table_name, grantee, privilege_type, is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name IN ('projects','operations','participants','project_participants','categories','finance_documents')
ORDER BY table_name, grantee, privilege_type;

SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('projects','operations','participants','project_participants','categories','finance_documents');

SELECT tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('projects','operations','participants','project_participants','categories','finance_documents')
ORDER BY tablename, policyname;

SELECT c.relname, t.tgname, t.tgenabled, pg_get_triggerdef(t.oid, true) AS trigger_definition,
       p.oid::regprocedure AS trigger_function,
       CASE WHEN p.prosrc ~* '(sb_secret_|service_role.{0,20}(key|token)|https?://|password|bearer)'
            THEN '[Function body omitted: inspect privately for embedded credentials]'
            ELSE pg_get_functiondef(p.oid) END AS function_definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'public' AND NOT t.tgisinternal
  AND c.relname IN ('projects','operations','participants','project_participants','categories','finance_documents')
ORDER BY c.relname, t.tgname;

SELECT tablename, indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('projects','operations','participants','project_participants','categories','finance_documents')
ORDER BY tablename, indexname;

ROLLBACK;