#!/usr/bin/env bash
# Сквозной тест проверки финансовых документов. Использует тестовую базу в памяти и тестовые ключи;
# рабочая финансовая база, секреты и основной сервер предпросмотра не затрагиваются.
set -euo pipefail
cd "$(dirname "$0")/../.."
export FAKE_DB_PORT=9911 E2E_OUT=/tmp/finance-e2e E2E_BASE=http://localhost:8090 E2E_DB=http://localhost:9911
export FINANCE_SUPABASE_URL=http://localhost:9911 FINANCE_SUPABASE_SERVICE_ROLE_KEY=e2e-test-only
export FIN_DOC_SIGNING_KEY_V2=e2e-test-key-$(head -c 24 /dev/urandom | base64 | tr -dc A-Za-z0-9) FIN_DOC_SIGNING_KEY=
rm -rf "$E2E_OUT"
bun tests/e2e/fake-finance-db.ts > /tmp/finance-e2e-db.log 2>&1 & DB_PID=$!
env -u LOVABLE_SANDBOX bunx vite dev --port 8090 --strictPort > /tmp/finance-e2e-vite.log 2>&1 & VITE_PID=$!
trap 'kill $DB_PID $VITE_PID 2>/dev/null || true' EXIT
for i in $(seq 1 60); do curl -sf -o /dev/null http://localhost:8090/ && break; sleep 1; done
bun tests/e2e/seed-finance-docs.ts
python3 tests/e2e/finance_verify_e2e.py
