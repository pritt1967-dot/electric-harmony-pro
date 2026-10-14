import { createFileRoute, notFound } from "@tanstack/react-router";
import { FileText } from "lucide-react";

import { getPublicCustomer } from "@/lib/estimate-public.functions";
import { formatDate, money, STATUS_LABEL, type EstimateStatus } from "@/lib/estimates";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders";

export const Route = createFileRoute("/klient/$token")({
  loader: async ({ params }) => {
    const data = await getPublicCustomer({ data: { token: params.token } }).catch(() => null);
    if (!data) throw notFound();
    return data;
  },
  head: () => ({
    meta: [
      { title: "Мои заказы — S&M Electric" },
      { name: "description", content: "Личная страница заказчика S&M Electric: сметы и статусы заказов по постоянному QR-коду." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Мои заказы — S&M Electric" },
      { property: "og:description", content: "Сметы и статусы заказов заказчика S&M Electric." },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-muted-foreground">Проверьте QR-код или свяжитесь с нами.</p>
    </main>
  ),
  component: CustomerPage,
});

function CustomerPage() {
  const c = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-2xl space-y-4 p-5">
      <h1 className="text-2xl font-bold">Мои заказы{c.name ? ` — ${c.name}` : ""}</h1>
      {c.estimates.length === 0 && <p className="text-muted-foreground">Заказов пока нет.</p>}
      {c.estimates.map((e) => (
        <a
          key={e.token}
          href={`/smeta/${e.token}`}
          className="block rounded-2xl border border-border bg-card p-4 hover:border-brand"
        >
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="size-4 text-brand" /> Смета № {e.number} от {formatDate(e.doc_date)}
          </div>
          <p className="text-sm text-muted-foreground">{e.object_name || e.address || "—"}</p>
          <p className="mt-1 font-bold">{money(Number(e.total))} ₽</p>
          <p className="text-sm">
            {e.order
              ? `Заказ № ${e.order.number}: ${orderStatusLabel(e.order.status)}, ${paymentStatusLabel(e.order.payment_status)}`
              : STATUS_LABEL[e.status as EstimateStatus] ?? e.status}
          </p>
        </a>
      ))}
    </main>
  );
}
