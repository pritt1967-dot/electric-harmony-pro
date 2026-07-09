import { useState, type FormEvent } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { Phone, MapPin, Clock, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";

import { CONTACTS } from "./contacts";
import { Reveal } from "./Reveal";
import { createSubmission } from "@/lib/submissions.functions";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Введите имя")
    .max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .min(6, "Введите телефон")
    .max(30, "Слишком длинный номер")
    .regex(/^[0-9+()\-\s]+$/, "Некорректный номер"),
  comment: z.string().trim().max(600, "Слишком длинное сообщение").optional(),
});

export function Contact() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submit = useServerFn(createSubmission);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      comment: (form.elements.namedItem("comment") as HTMLTextAreaElement).value,
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
    <section id="contacts" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand">
            Контакты
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Оставьте заявку — рассчитаем стоимость
          </h2>
          <p className="mt-3 text-muted-foreground">
            Перезвоним в течение 15 минут, ответим на вопросы и бесплатно
            рассчитаем электромонтаж по вашему объекту в СПб.
          </p>

          <div className="mt-8 space-y-4">
            <a href={CONTACTS.phoneHref} className="flex items-center gap-3 text-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">Телефон</span>
                <span className="font-semibold">{CONTACTS.phoneDisplay}</span>
              </span>
            </a>
            <a href={`mailto:${CONTACTS.email}`} className="flex items-center gap-3 text-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Mail className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">Почта</span>
                <span className="font-semibold">{CONTACTS.email}</span>
              </span>
            </a>
            <div className="flex items-center gap-3 text-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <MapPin className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">Адрес</span>
                <span className="font-semibold">{CONTACTS.address}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Clock className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">Режим работы</span>
                <span className="font-semibold">{CONTACTS.hours}</span>
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-brand sm:p-8">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 className="size-14 text-brand" />
                <h3 className="mt-4 text-xl font-bold">Заявка отправлена!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Спасибо! Наш электрик свяжется с вами в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
                >
                  Отправить ещё одну
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    Ваше имя
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Иван"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                    Телефон
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="comment" className="mb-1.5 block text-sm font-medium">
                    Комментарий
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows={3}
                    placeholder="Опишите задачу: монтаж проводки, сборка щита…"
                    className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  {errors.comment && (
                    <p className="mt-1 text-xs text-destructive">{errors.comment}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 text-base font-semibold text-brand-foreground shadow-brand transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
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
