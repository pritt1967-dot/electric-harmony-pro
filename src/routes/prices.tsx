import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CONTACTS } from "@/components/site/contacts";
import { canonical } from "@/lib/seo";
import { createSubmission } from "@/lib/submissions.functions";
import {
  PUBLIC_CATEGORIES,
  getPublicPrices,
  type PublicPriceItem,
} from "@/lib/prices.functions";

const TITLE =
  "Цены на электромонтажные работы в Санкт-Петербурге и Ленинградской области | S&M Electric";
const DESCRIPTION =
  "Цены на электромонтаж в СПб и Ленобласти: монтаж электропроводки, сборка электрощита, заземление, установка розеток и светильников. Онлайн-калькулятор и точная смета до начала работ.";

const pricesQuery = queryOptions({
  queryKey: ["public-prices"],
  queryFn: () => getPublicPrices(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/prices")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/prices") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: canonical("/prices") }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pricesQuery),
  component: PricesPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center text-muted-foreground">
      Не удалось загрузить прайс. {error.message}
    </div>
  ),
});

function money(v: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(v);
}

function PricesPage() {
  const { data: items } = useSuspenseQuery(pricesQuery);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [active, setActive] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formKind, setFormKind] = useState<"estimate" | "lead">("estimate");
  const [sending, setSending] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => {
    const present = new Set(items.map((i) => i.public_category));
    const ordered = PUBLIC_CATEGORIES.filter((c) => present.has(c));
    const extra = [...present].filter(
      (c) => !PUBLIC_CATEGORIES.includes(c as (typeof PUBLIC_CATEGORIES)[number]),
    );
    return [...ordered, ...extra];
  }, [items]);

  const shown = useMemo(
    () => (active ? items.filter((i) => i.public_category === active) : items),
    [items, active],
  );

  const picked = useMemo(
    () =>
      items
        .filter((i) => qty[i.id] > 0)
        .map((i) => ({ item: i, count: qty[i.id], sum: qty[i.id] * i.price })),
    [items, qty],
  );

  const total = picked.reduce((s, p) => s + p.sum, 0);

  function add(item: PublicPriceItem) {
    setQty((q) => ({ ...q, [item.id]: (q[item.id] ?? 0) + 1 }));
    toast.success(`«${item.name}» добавлена в расчёт`);
  }

  function setCount(id: string, value: number) {
    setQty((q) => ({ ...q, [id]: Math.max(0, value) }));
  }

  function openForm(kind: "estimate" | "lead") {
    if (kind === "estimate" && picked.length === 0) {
      toast.error("Добавьте работы в расчёт");
      return;
    }
    setFormKind(kind);
    setFormOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const lines = picked
      .map(
        (p) =>
          `• ${p.item.name} — ${p.count} ${p.item.unit} × ${money(p.item.price)} ₽ = ${money(p.sum)} ₽`,
      )
      .join("\n");
    const comment = [
      formKind === "estimate"
        ? "Запрос сметы с калькулятора цен"
        : "Заявка со страницы «Цены»",
      lines,
      picked.length ? `Итого предварительно: ${money(total)} ₽` : "",
      String(form.get("comment") ?? "").trim(),
    ]
      .filter(Boolean)
      .join("\n")
      .slice(0, 600);

    setSending(true);
    try {
      await createSubmission({
        data: {
          name: String(form.get("name") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
          comment,
        },
      });
      toast.success("Заявка отправлена — перезвоним и пришлём смету");
      setFormOpen(false);
    } catch (err) {
      toast.error("Не удалось отправить: " + (err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main>
        {/* Intro */}
        <section className="border-b border-border bg-ink text-ink-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand">
              Прайс-лист
            </p>
            <h1 className="mt-4 max-w-4xl text-[clamp(2rem,6vw,4rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em]">
              Цены на электромонтаж
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              Указываем ориентировочную стоимость работ. Точная цена зависит от
              объёма, сложности и условий объекта. Рассчитаем стоимость до
              начала работ.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  calcRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex h-14 items-center gap-2 rounded-sm bg-brand px-7 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground transition-transform hover:scale-[1.02]"
              >
                Рассчитать стоимость <ArrowRight className="size-4" />
              </button>
              <a
                href={CONTACTS.phoneHref}
                className="inline-flex h-14 items-center gap-2 rounded-sm border border-ink-border px-7 text-sm font-bold uppercase tracking-[0.08em] text-ink-foreground transition-colors hover:border-brand hover:text-brand"
              >
                Получить консультацию
              </a>
            </div>
          </div>
        </section>

        {/* Категории */}
        <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur lg:top-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              <CatChip
                label="Все работы"
                active={active === null}
                onClick={() => setActive(null)}
              />
              {categories.map((c) => (
                <CatChip
                  key={c}
                  label={c}
                  active={active === c}
                  onClick={() => setActive(c)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Карточки */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <article
                key={item.id}
                className="flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-brand"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {item.public_category}
                </p>
                <h2 className="mt-2 text-base font-bold leading-snug">
                  {item.name}
                </h2>
                {item.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <p className="mt-4 text-2xl font-extrabold tracking-tight">
                  {item.price_from && (
                    <span className="text-base font-semibold text-muted-foreground">
                      от{" "}
                    </span>
                  )}
                  {money(item.price)} ₽
                  <span className="text-sm font-semibold text-muted-foreground">
                    {" "}
                    / {item.unit}
                  </span>
                </p>
                <div className="mt-4 flex-1" />
                {item.in_calculator ? (
                  <button
                    type="button"
                    onClick={() => add(item)}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-ink px-5 text-sm font-bold uppercase tracking-[0.06em] text-ink-foreground transition-colors hover:bg-ink-elevated"
                  >
                    {qty[item.id] > 0 ? (
                      <>
                        <Check className="size-4 text-brand" /> В расчёте:{" "}
                        {qty[item.id]}
                      </>
                    ) : (
                      <>
                        <Plus className="size-4" /> Добавить в расчёт
                      </>
                    )}
                  </button>
                ) : (
                  <a
                    href="#calc"
                    className="inline-flex h-12 items-center justify-center rounded-sm border border-border px-5 text-sm font-bold uppercase tracking-[0.06em] transition-colors hover:border-brand"
                  >
                    Уточнить цену
                  </a>
                )}
              </article>
            ))}
          </div>
          {shown.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">
              В этой категории пока нет опубликованных позиций.
            </p>
          )}
        </section>

        {/* Калькулятор */}
        <section
          id="calc"
          ref={calcRef}
          className="scroll-mt-24 border-y border-border bg-secondary/40 py-14 lg:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Калькулятор
            </p>
            <h2 className="mt-3 text-[clamp(1.7rem,4vw,2.8rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
              Предварительный расчёт
            </h2>

            {picked.length === 0 ? (
              <p className="mt-6 max-w-2xl text-muted-foreground">
                Добавьте работы кнопкой «Добавить в расчёт» — здесь появится
                предварительная стоимость.
              </p>
            ) : (
              <div className="mt-8 overflow-hidden rounded-lg border border-border bg-background">
                {picked.map((p) => (
                  <div
                    key={p.item.id}
                    className="flex flex-wrap items-center gap-3 border-b border-border p-4 last:border-0"
                  >
                    <div className="min-w-48 flex-1">
                      <p className="font-semibold">{p.item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {money(p.item.price)} ₽ / {p.item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Меньше"
                        onClick={() => setCount(p.item.id, p.count - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <Input
                        className="h-10 w-20 text-center"
                        type="number"
                        min={0}
                        value={p.count}
                        onChange={(e) =>
                          setCount(p.item.id, Number(e.target.value))
                        }
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Больше"
                        onClick={() => setCount(p.item.id, p.count + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <p className="w-28 text-right font-extrabold">
                      {money(p.sum)} ₽
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Убрать"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setCount(p.item.id, 0)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-4 bg-ink p-5 text-ink-foreground">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                      Предварительно
                    </p>
                    <p className="text-3xl font-extrabold tracking-tight">
                      {money(total)} ₽
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openForm("estimate")}
                      className="inline-flex h-13 items-center gap-2 rounded-sm bg-brand px-6 py-4 text-sm font-bold uppercase tracking-[0.06em] text-brand-foreground"
                    >
                      Получить смету
                    </button>
                    <button
                      type="button"
                      onClick={() => openForm("lead")}
                      className="inline-flex h-13 items-center gap-2 rounded-sm border border-ink-border px-6 py-4 text-sm font-bold uppercase tracking-[0.06em]"
                    >
                      Оставить заявку
                    </button>
                  </div>
                </div>
              </div>
            )}

            {picked.length === 0 && (
              <button
                type="button"
                onClick={() => openForm("lead")}
                className="mt-6 inline-flex h-14 items-center gap-2 rounded-sm bg-ink px-7 text-sm font-bold uppercase tracking-[0.08em] text-ink-foreground"
              >
                Оставить заявку <ArrowRight className="size-4" />
              </button>
            )}

            <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
              Расчёт предварительный и не является офертой. Итоговая смета
              формируется по позициям прайса S&amp;M Electric после осмотра
              объекта.
            </p>
          </div>
        </section>
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {formKind === "estimate" ? "Получить смету" : "Оставить заявку"}
            </DialogTitle>
            <DialogDescription>
              {picked.length
                ? `Позиций в расчёте: ${picked.length}. Предварительно ${money(total)} ₽.`
                : "Перезвоним и уточним детали объекта."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="calc-name">Имя</Label>
              <Input id="calc-name" name="name" required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calc-phone">Телефон</Label>
              <Input
                id="calc-phone"
                name="phone"
                type="tel"
                required
                placeholder="+7 900 000-00-00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calc-comment">Комментарий</Label>
              <Input
                id="calc-comment"
                name="comment"
                placeholder="Адрес объекта, сроки"
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Отправить
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
      <FloatingActions />
      <MobileCtaBar />
    </div>
  );
}

function CatChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-sm border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
        active
          ? "border-ink bg-ink text-ink-foreground"
          : "border-border bg-background text-muted-foreground hover:border-brand hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
