import { useEffect, useState } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";

import logoAsset from "@/assets/logo.png.asset.json";
import { CONTACTS } from "./contacts";

const NAV = [
  { label: "Главная", href: "#top" },
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#works" },
  { label: "О компании", href: "#about" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-border/70 bg-ink/95 text-ink-foreground backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6 lg:h-20 lg:grid-cols-[auto_1fr_auto]">
        <a href="#top" className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-ink-elevated">
            <img
              src={logoAsset.url}
              alt="S&M Electric — логотип электромонтажной компании"
              width={40}
              height={40}
              className="size-10 object-contain"
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-extrabold tracking-tight sm:text-lg">
              S&amp;M Electric
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
              Электромонтаж
            </span>
          </span>
        </a>

        <nav className="hidden items-center justify-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm font-semibold text-ink-muted transition-colors hover:text-ink-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:bg-brand after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CONTACTS.phoneHref}
            className="hidden items-center gap-2 text-sm font-bold text-ink-foreground transition-colors hover:text-brand xl:flex"
          >
            <Phone className="size-4 text-brand" />
            {CONTACTS.phoneDisplay}
          </a>
          <a
            href="#contacts"
            className="hidden items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground transition-transform hover:scale-[1.03] md:inline-flex"
          >
            Рассчитать стоимость <ArrowRight className="size-4" />
          </a>
          <button
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-11 place-items-center rounded-md border border-ink-border text-ink-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-border bg-ink lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink-border/60 py-4 text-base font-semibold text-ink-foreground last:border-0"
              >
                {item.label}
              </a>
            ))}
            <a
              href={CONTACTS.phoneHref}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-ink-border py-3.5 text-sm font-bold text-ink-foreground"
            >
              <Phone className="size-4 text-brand" />
              {CONTACTS.phoneDisplay}
            </a>
            <a
              href="#contacts"
              onClick={() => setOpen(false)}
              className="mb-2 mt-2 rounded-md bg-brand py-3.5 text-center text-sm font-bold text-brand-foreground"
            >
              Рассчитать стоимость
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

export function MobileCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-border bg-ink/95 px-3 py-2.5 backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={CONTACTS.phoneHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-ink-border text-sm font-bold text-ink-foreground"
        >
          <Phone className="size-4 text-brand" /> Позвонить
        </a>
        <a
          href="#contacts"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand text-sm font-bold text-brand-foreground"
        >
          Рассчитать стоимость
        </a>
      </div>
    </div>
  );
}
