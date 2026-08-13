import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import {
  Phone,
  MapPin,
  Clock,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Printer,
  Download,
} from "lucide-react";

import { CONTACTS } from "./contacts";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { createSubmission } from "@/lib/submissions.functions";

const schema = z.object({
  name: z.string().trim().min(2, "Введите имя").max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .min(6, "Введите телефон")
    .max(30, "Слишком длинный номер")
    .regex(/^[0-9+()\-\s]+$/, "Некорректный номер"),
  comment: z.string().trim().max(600, "Слишком длинное сообщение").optional(),
});

const OBJECT_TYPES = ["Квартира", "Частный дом", "Коммерческий объект", "Другое"];
const SERVICES = [
  "Монтаж электропроводки",
  "Сборка и монтаж электрощита",
  "Заземление",
  "Освещение",
  "Розетки и выключатели",
  "Диагностика и поиск неисправностей",
  "Модернизация электрики",
  "Другое",
];

const fieldClass =
  "w-full rounded-md border border-input bg-background px-4 py-3.5 text-base outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/25 sm:text-sm";

const contactItems = [
  { icon: Phone, label: "Телефон", value: CONTACTS.phoneDisplay, href: CONTACTS.phoneHref },
  {
    icon: Phone,
    label: "Дополнительный телефон",
    value: CONTACTS.secondaryPhoneDisplay,
    href: CONTACTS.secondaryPhoneHref,
  },
  { icon: Mail, label: "Почта", value: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
  { icon: MapPin, label: "Адрес", value: CONTACTS.address, href: null },
  { icon: Clock, label: "Режим работы", value: CONTACTS.hours, href: null },
];

export function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submit = useServerFn(createSubmission);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const el = (n: string) =>
      form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

    const objectType = el("objectType").value;
    const area = el("area").value;
    const service = el("service").value;
    const note = el("comment").value;

    const details = [
      objectType && `Тип объекта: ${objectType}`,
      area && `Площадь: ${area} м²`,
      service && `Услуга: ${service}`,
      note && `Комментарий: ${note}`,
    ]
      .filter(Boolean)
      .join("\n");

    const data = {
      name: el("name").value,
      phone: el("phone").value,
      comment: details,
    };

    const result = schema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      await submit({ data: result.data });
      setSent(true);
      form.reset();
    } catch {
      setSubmitError(
        "Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contacts"
      className="relative overflow-hidden scroll-mt-20 bg-ink text-ink-foreground"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-50" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-24">
        <Reveal>
          <SectionHeading
            tone="dark"
            eyebrow="Контакты"
            title="Рассчитаем ваш объект"
            subtitle="Оставьте информацию об объекте — подготовим расчёт стоимости. Перезвоним и уточним детали."

          />

          <div className="mt-8 space-y-3">
            {contactItems.map((item) => {
              const Inner = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-md border border-ink-border text-brand">
                    <item.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-ink-muted">{item.label}</span>
                    <span className="block truncate font-bold">{item.value}</span>
                  </span>
                </>
              );
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 text-sm transition-colors hover:text-brand"
                >
                  {Inner}
                </a>
              ) : (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  {Inner}
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-lg border border-ink-border bg-ink-elevated p-4">
            <div className="flex items-center gap-4">
              <img
                src="/qr-site.png"
                alt="QR-код сайта S&M Electric"
                width={96}
                height={96}
                loading="lazy"
                className="size-24 shrink-0 rounded-md bg-white p-1.5"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold">Отсканируйте QR-код</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Быстрый переход на сайт с мобильного телефона
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href="/contact-card?print=1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-bold text-brand-foreground"
              >
                <Printer className="size-4" />
                Печатная карточка
              </a>
              <a
                href="/api/public/contact-card.pdf"
                className="inline-flex items-center gap-2 rounded-md border border-ink-border px-4 py-2.5 text-sm font-bold text-ink-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <Download className="size-4" />
                Скачать PDF
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-border bg-background p-5 text-foreground soft-shadow sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckCircle2 className="size-14 text-brand" />
                <h3 className="mt-4 text-xl font-extrabold">Заявка отправлена!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Спасибо! Наш электрик свяжется с вами в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-full border border-border px-6 py-3 text-sm font-bold transition-colors hover:bg-accent"
                >
                  Отправить ещё одну
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-semibold">
                      Ваше имя
                    </label>
                    <input id="name" name="name" type="text" placeholder="Иван" className={fieldClass} />
                    {errors.name && (
                      <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">
                      Телефон
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+7 (___) ___-__-__"
                      className={fieldClass}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="objectType" className="mb-1.5 block text-sm font-semibold">
                      Тип объекта
                    </label>
                    <select id="objectType" name="objectType" defaultValue="" className={fieldClass}>
                      <option value="">Не выбрано</option>
                      {OBJECT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="area" className="mb-1.5 block text-sm font-semibold">
                      Площадь, м²
                    </label>
                    <input
                      id="area"
                      name="area"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="65"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service" className="mb-1.5 block text-sm font-semibold">
                    Интересующая услуга
                  </label>
                  <select id="service" name="service" defaultValue="" className={fieldClass}>
                    <option value="">Не выбрано</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="comment" className="mb-1.5 block text-sm font-semibold">
                    Комментарий
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    placeholder="Опишите задачу: монтаж проводки, сборка щита…"
                    className={`${fieldClass} resize-none`}
                  />
                  {errors.comment && (
                    <p className="mt-1 text-xs text-destructive">{errors.comment}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-brand text-base font-bold text-brand-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      Отправляем… <Loader2 className="size-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      Получить расчёт <Send className="size-4" />
                    </>
                  )}
                </button>
                {submitError && (
                  <p className="text-center text-xs text-destructive">{submitError}</p>
                )}
                <p className="text-center text-xs text-muted-foreground">
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                </p>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
