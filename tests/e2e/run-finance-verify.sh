#!/usr/bin/env bash
# Сквозной тест полного цикла проверки финансовых документов.
# Тестовая база в памяти и одноразовый тестовый ключ: рабочая финансовая база, секреты,
# REG.RU и основной предпросмотр не затрагиваются. Нужны pdftoppm и nix (zbar для чтения QR).
set -euo pipefail
cd "$(dirname "$0")/../.."
export FAKE_DB_PORT=9911 E2E_OUT=/tmp/finance-e2e E2E_BASE=http://localhost:8090 E2E_BASE_NOKEY=http://localhost:8091 E2E_DB=http://localhost:9911
export FINANCE_SUPABASE_URL=http://localhost:9911 FINANCE_SUPABASE_SERVICE_ROLE_KEY=e2e-test-only
KEY="e2e-test-key-$(head -c 32 /dev/urandom | base64 | tr -dc A-Za-z0-9)"
rm -rf "$E2E_OUT"; mkdir -p "$E2E_OUT"
bun tests/e2e/fake-finance-db.ts > /tmp/finance-e2e-db.log 2>&1 & P1=$!
FIN_DOC_SIGNING_KEY_V2="$KEY" FIN_DOC_SIGNING_KEY= env -u LOVABLE_SANDBOX bunx vite dev --port 8090 --strictPort > /tmp/finance-e2e-vite.log 2>&1 & P2=$!
FIN_DOC_SIGNING_KEY_V2= FIN_DOC_SIGNING_KEY= env -u LOVABLE_SANDBOX bunx vite dev --port 8091 --strictPort > /tmp/finance-e2e-vite-nokey.log 2>&1 & P3=$!
trap 'kill $P1 $P2 $P3 2>/dev/null || true' EXIT
for port in 8090 8091; do for i in $(seq 1 90); do curl -sf -o /dev/null http://localhost:$port/ && break; sleep 1; done; done
export FIN_DOC_SIGNING_KEY_V2="$KEY" FIN_DOC_SIGNING_KEY=
bun tests/e2e/seed-finance-docs.ts
python3 tests/e2e/finance_verify_e2e.py
