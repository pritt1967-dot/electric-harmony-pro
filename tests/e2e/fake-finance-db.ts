/** Тестовая копия финансовой базы (PostgREST-подмножество) в памяти. Рабочую базу не трогает. */
type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = {
  operations: [
    { id: "op-1", project_id: "p-e2e", operation_date: "2026-10-01", operation_type: "income", amount: 100000, from_participant_id: null, to_participant_id: null, from_name: "Заказчик", to_name: "S&M", category_id: null, comment: "Аванс" },
    { id: "op-2", project_id: "p-e2e", operation_date: "2026-10-02", operation_type: "expense", amount: 25000, from_participant_id: null, to_participant_id: null, from_name: "S&M", to_name: "Поставщик", category_id: null, comment: "Кабель" },
  ],
  finance_documents: [],
};
function match(row: Row, key: string, cond: string): boolean {
  const v = row[key];
  if (cond === "is.null") return v === null || v === undefined;
  if (cond.startsWith("eq.")) return String(v) === cond.slice(3);
  if (cond.startsWith("in.(")) return cond.slice(4, -1).split(",").map((s) => s.replace(/^"|"$/g, "")).includes(String(v));
  return true;
}
const port = Number(process.env.FAKE_DB_PORT ?? 9911);
Bun.serve({
  port,
  async fetch(req) {
    const u = new URL(req.url);
    const table = u.pathname.replace(/^\/rest\/v1\//, "");
    const rows = tables[table];
    if (!rows) return Response.json({ message: "not found" }, { status: 404 });
    const filters = [...u.searchParams].filter(([k]) => !["select", "limit"].includes(k));
    const hit = rows.filter((r) => filters.every(([k, c]) => match(r, k, c)));
    if (req.method === "GET") return Response.json(hit.slice(0, Number(u.searchParams.get("limit") ?? 1e9)));
    const body = (await req.json()) as Row;
    if (req.method === "POST") {
      if (table === "finance_documents" && rows.some((r) => r.id === body.id)) return Response.json({ message: "duplicate 23505" }, { status: 409 });
      rows.push({ ...body });
      return new Response(null, { status: 201 });
    }
    if (req.method === "PATCH") {
      // Как триггер из v3: зафиксированный PDF не перезаписывается.
      if (table === "finance_documents" && hit.some((r) => r.pdf_sha256) && "pdf_sha256" in body) return Response.json({ message: "Отпечаток PDF уже зафиксирован" }, { status: 400 });
      hit.forEach((r) => Object.assign(r, body));
      return Response.json(hit);
    }
    return new Response(null, { status: 405 });
  },
});
console.log(`fake finance db on ${port}`);
