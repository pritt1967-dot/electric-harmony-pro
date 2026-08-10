import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Phone, Mail, MapPin, Clock, Printer, Download } from "lucide-react";

import logoAsset from "@/assets/logo.png.asset.json";
import { CONTACTS } from "@/components/site/contacts";

export const Route = createFileRoute("/contact-card")({
  head: () => ({
    meta: [
      { title: "Контакты S&M electric — печатная карточка" },
      {
        name: "description",
        content:
          "Контактная карточка S&M electric с QR-кодом, телефонами и адресом. Сохраните в PDF и отправьте клиенту.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ContactCardPage,
});

const SITE_URL = "https://electric-9117335567.lovable.app";

function ContactCardPage() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("print") === "1"
    ) {
      const timer = setTimeout(() => window.print(), 700);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-muted p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl print:max-w-none">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-3 print:hidden">
          <Link
            to="/api/public/contact-card.pdf"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <Download className="size-4" />
            Скачать PDF
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-transform hover:scale-[1.02]"
          >
            <Printer className="size-4" />
            Сохранить PDF
          </button>
        </div>

        <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-brand print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <header className="gradient-hero flex items-center gap-4 px-8 py-8 print:bg-white print:px-6 print:py-6">
            <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-foreground p-2.5">
              <img
                src={logoAsset.url}
                alt="S&M Electric"
                className="size-full object-contain"
              />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                S&M electric
              </h1>
              <p className="text-sm text-muted-foreground">
                Электромонтаж в Санкт-Петербурге и области
              </p>
            </div>
          </header>

          <div className="grid gap-8 px-8 py-10 md:grid-cols-2 print:px-6 print:py-6">
            <div className="space-y-5">
              <ContactRow
                icon={<Phone className="size-5" />}
                label="Телефон"
                value={CONTACTS.phoneDisplay}
                href={CONTACTS.phoneHref}
                primary
              />
              <ContactRow
                icon={<Phone className="size-5" />}
                label="Дополнительный"
                value={CONTACTS.secondaryPhoneDisplay}
                href={CONTACTS.secondaryPhoneHref}
              />
              <ContactRow
                icon={<Mail className="size-5" />}
                label="Email"
                value={CONTACTS.email}
                href={`mailto:${CONTACTS.email}`}
              />
              <ContactRow
                icon={<MapPin className="size-5" />}
                label="Адрес"
                value={CONTACTS.address}
              />
              <ContactRow
                icon={<Clock className="size-5" />}
                label="Режим работы"
                value={CONTACTS.hours}
              />
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-6">
              <img
                src="/qr-site.png"
                alt="QR-код сайта S&M Electric"
                width={176}
                height={176}
                className="size-44"
              />
              <p className="mt-4 text-center text-sm font-semibold">
                Отсканируйте QR-код
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Переход на сайт с телефона
              </p>
              <p className="mt-2 max-w-full break-all text-center text-xs font-medium text-brand">
                {SITE_URL}
              </p>
            </div>
          </div>

          <footer className="bg-brand px-8 py-5 text-center text-sm font-medium text-white print:bg-white print:text-black">
            Выезд электрика по Санкт-Петербургу и области. Договор, гарантия,
            смета.
          </footer>

        </article>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  primary?: boolean;
}) {
  const content = (
    <>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        {icon}
      </span>
      <span>
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span
          className={`font-semibold ${
            primary ? "text-lg" : "text-base"
          } text-foreground`}
        >
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className="flex items-center gap-3 text-sm">
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3 text-sm">{content}</div>;
}
