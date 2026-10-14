<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

Tuqo deployment test
- Finance membership removal deletes only the project_participants link through the existing authenticated server transport and verifies it reads back absent; keep historical participants separate from active membership so balances and reports retain all operations.
- GigaChat (src/lib/ai-check/providers/gigachat.server.ts) is an optional server-only advisor for panel-validator: its advice never changes validator status/checks or the project; missing GIGACHAT_AUTH_KEY means unavailable, not an error.
- Single-line rendering embeds imported library SVG paths with uniform transforms and exact SVG endpoints; use the Doc1 column pitch, right-origin input layout, and shared column centers for the group table, without importing reference devices or changing project topology. Scope marker IDs per occurrence to preserve geometry and avoid false connections.
- Single-line preview and SVG export must not switch to legacy rectangle symbols on validation errors; render available circuits with the shared library generator, or return no drawing if rendering is impossible, so incomplete data never changes symbol geometry.
- Finance documents (reports and single income/expense/refund/transfer operations) are signed server-side with versioned keys (key_version; new docs use FIN_DOC_SIGNING_KEY_V2, v1 key verify-only): the server re-reads operations, stores fingerprint, QR-token SHA-256 and HMAC in finance DB `finance_documents` (DDL in docs/finance-documents*.sql); public /verify/$id reveals only status/type/date/check code and returns valid only when QR token, record signature and operations fingerprint all match.
