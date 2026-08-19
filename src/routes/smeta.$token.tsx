import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, CreditCard, Loader2, MessageCircle, Phone, Send } from "lucide-react";
import { Toaster, toast } from "sonner";

import { LOGO_URL } from "@/lib/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACTS } from "@/components/site/contacts";
import {
  approvePublicEstimate,
  getPublicEstimate,
  requestOrderPayment,
  type PublicEstimate,
} from "@/lib/estimate-public.functions";
import {
  discountAmount,
  formatDate,
  lineTotal,
  money,
  subtotal,
} from "@/lib/estimates";
import {
  orderStatusLabel,
  paymentStatusLabel,
  remainingAmount,
} from "@/lib/orders";

export const Route = createFileRoute("/smeta/$token")({
  head: () => ({
    meta: [
      { title: "Смета S&M Electric — просмотр и согласование" },
      {
        name: "description",
        content:
          "Персональная смета на электромонтажные работы от S&M Electric: состав работ, стоимость и онлайн-согласование заказа.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Смета S&M Electric" },
      {
        property: "og:description",
        content: "Просмотрите смету на электромонтажные работы и согласуйте заказ онлайн.",
      },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicEstimatePage,
});

/** Single human-readable state for the whole estimate → order lifecycle. */
function lifecycleLabel(est: PublicEstimate) {
  if (!est.approved_at) return "На согласовании";
  const order = est.order;
  if (!order) return "Согласована";
  if (order.status === "done") return "Завершено";
  if (order.status === "in_progress") return "В работе";
  if (order.payment_status === "paid") return "Оплачено";
  if (order.payment_status === "partial") return "Оплачено частично";
  if (order.status === "awaiting_payment") return "Ожидает оплаты";
  return "Заказ создан";
}

function sessionId() {
  if (typeof window === "undefined") return "";
  const key = "sm-session-id";
  let v = window.localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    window.localStorage.setItem(key, v);
  }
  return v;
}

function PublicEstimatePage() {
  const { token } = Route.useParams();
  const fetchEstimate = useServerFn(getPublicEstimate);
  const approve = useServerFn(approvePublicEstimate);
  const pay = useServerFn(requestOrderPayment);

  const [est, setEst] = useState<PublicEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let active = true;
    fetchEstimate({ data: { token } })
      .then((r) => {
        if (!active) return;
        setEst(r);
        setName(r?.customer_name ?? "");
      })
      .catch(() => undefined)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [token, fetchEstimate]);

  async function confirm() {
    if (!name.trim()) {
      toast.error("Укажите имя заказчика");
      return;
    }
    setSaving(true);
    try {
      const r = await approve({ data: { token, name, session: sessionId() } });
      setEst(r);
      setOpen(false);
      toast.success(
        r?.order?.number
          ? `Смета согласована. Заказ № ${r.order.number}`
          : "Смета согласована",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось согласовать смету");
    }
    setSaving(false);
  }

  async function requestPayment(kind: "full" | "prepay" | "rest") {
    setPaying(true);
    try {
      const res = await pay({ data: { token, kind } });
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        return;
      }
      const fresh = await fetchEstimate({ data: { token } });
      setEst(fresh);
      setPayOpen(false);
      toast.success("Заявка на оплату отправлена — мы пришлём счёт и реквизиты.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось отправить заявку");
    }
    setPaying(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/30">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!est) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-secondary/30 px-6 text-center">
        <h1 className="text-xl font-bold">Смета не найдена</h1>
        <p className="text-sm text-muted-foreground">
          Проверьте ссылку или свяжитесь с нами: {CONTACTS.phoneDisplay}
        </p>
      </div>
    );
  }

  const sub = subtotal(est.items);
  const disc = discountAmount(est.items, est.discount_type, est.discount_value);
  const approved = Boolean(est.approved_at);
  const order = est.order;
  const paid = Number(order?.paid_amount ?? 0);
  const rest = remainingAmount(est.total, paid);

  return (
    <div className="min-h-screen bg-secondary/30 pb-16">
      <Toaster richColors position="top-center" />

      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <img src={LOGO_URL} alt="S&M Electric" className="size-10 object-contain" />
          <div className="min-w-0">
            <p className="truncate font-extrabold">S&M Electric</p>
            <p className="truncate text-xs text-muted-foreground">
              Профессиональные электромонтажные работы
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                Смета № {est.number || "—"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                от {formatDate(est.doc_date)} · версия {est.version}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                approved
                  ? "bg-brand text-brand-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {lifecycleLabel(est)}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Row label="Заказчик" value={est.customer_name || "—"} />
            <Row label="Объект" value={est.object_name || est.address || "—"} />
            <Row label="Адрес" value={est.address || "—"} />
            <Row label="Дата" value={formatDate(est.doc_date)} />
            {est.work_period && <Row label="Срок выполнения" value={est.work_period} />}
            {est.valid_until && <Row label="Предложение действует" value={est.valid_until} />}
            {order && <Row label="Заказ" value={`№ ${order.number}`} />}
            {approved && (
              <Row
                label="Согласована"
                value={new Date(est.approved_at!).toLocaleString("ru-RU")}
              />
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-bold">Работы и материалы</h2>
          <div className="mt-4 space-y-3">
            {est.items.map((item, i) => (
              <div key={item.id ?? i} className="rounded-xl border border-border p-3">
                <div className="flex gap-2 font-medium">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  <span className="min-w-0">{item.name}</span>
                </div>
                {item.comment && (
                  <p className="mt-1 pl-6 text-xs text-muted-foreground">{item.comment}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pl-6 text-sm">
                  <span className="text-muted-foreground">
                    {item.qty} {item.unit} × {money(item.price)} ₽
                  </span>
                  <span className="font-semibold">{money(lineTotal(item))} ₽</span>
                </div>
              </div>
            ))}
            {est.items.length === 0 && (
              <p className="text-sm text-muted-foreground">Позиции не добавлены.</p>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-secondary/50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Стоимость работ</span>
              <span>{money(sub)} ₽</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Скидка</span>
              <span>− {money(disc)} ₽</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-lg font-extrabold text-brand">
              <span>ИТОГО</span>
              <span>{money(est.total)} ₽</span>
            </div>
          </div>

          {est.note && (
            <p className="mt-4 rounded-xl bg-secondary/50 p-3 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Комментарий: </span>
              {est.note}
            </p>
          )}
        </section>

        {approved && order && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Оплата</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <Row label="Статус заказа" value={orderStatusLabel(order.status)} />
              <Row label="Статус оплаты" value={paymentStatusLabel(order.payment_status)} />
              <Row label="Оплачено" value={`${money(paid)} ₽`} />
              <Row label="Остаток к оплате" value={`${money(rest)} ₽`} />
            </dl>
            {order.payment_status !== "paid" && (
              <Button
                className="mt-4 h-12 w-full text-base"
                onClick={() => setPayOpen(true)}
              >
                <CreditCard className="mr-2 size-5" /> Оплатить заказ
              </Button>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-border bg-card p-5">
          {approved ? (
            <div className="flex items-start gap-3 rounded-xl bg-secondary/50 p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
              <div className="text-sm">
                <p className="font-semibold">
                  Смета согласована{order ? `. Заказ № ${order.number}` : ""}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {est.approved_by_name ? `${est.approved_by_name}, ` : ""}
                  {new Date(est.approved_at!).toLocaleString("ru-RU")}. Согласованная
                  версия зафиксирована и не изменяется — мы свяжемся с вами для уточнения
                  деталей.
                </p>
              </div>
            </div>
          ) : (
            <Button className="h-12 w-full text-base" onClick={() => setOpen(true)}>
              СОГЛАСОВАТЬ СМЕТУ
            </Button>
          )}
          <Button
            variant="outline"
            className="mt-3 h-12 w-full text-base"
            onClick={() => setAskOpen(true)}
          >
            Задать вопрос
          </Button>
        </section>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Согласование сметы</DialogTitle>
            <DialogDescription>
              Подтверждая смету, вы соглашаетесь с указанным перечнем работ, материалов и
              стоимостью заказа — {money(est.total)} ₽.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Имя заказчика</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
            />
          </div>
          <DialogFooter>
            <Button onClick={confirm} disabled={saving} className="h-11 w-full">
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Подтвердить согласование
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Оплата заказа{order ? ` № ${order.number}` : ""}</DialogTitle>
            <DialogDescription>
              Выберите вариант оплаты — мы пришлём счёт и реквизиты. Онлайн-эквайринг
              будет подключён дополнительно.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button
              className="h-12 justify-between"
              disabled={paying}
              onClick={() => requestPayment("full")}
            >
              <span>Полная оплата</span>
              <span>{money(est.total)} ₽</span>
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-between"
              disabled={paying}
              onClick={() => requestPayment("prepay")}
            >
              <span>Предоплата 30%</span>
              <span>{money(Math.round(est.total * 30) / 100)} ₽</span>
            </Button>
            {paid > 0 && (
              <Button
                variant="outline"
                className="h-12 justify-between"
                disabled={paying}
                onClick={() => requestPayment("rest")}
              >
                <span>Остаток к оплате</span>
                <span>{money(rest)} ₽</span>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Задать вопрос по смете</DialogTitle>
            <DialogDescription>Выберите удобный способ связи.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="h-12 justify-start">
              <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 size-5" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 justify-start">
              <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer">
                <Send className="mr-2 size-5" /> Telegram
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12 justify-start">
              <a href={CONTACTS.phoneHref}>
                <Phone className="mr-2 size-5" /> {CONTACTS.phoneDisplay}
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}:</dt>
      <dd className="min-w-0 font-medium">{value}</dd>
    </div>
  );
}
