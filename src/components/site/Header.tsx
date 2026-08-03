import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

import logoAsset from "@/assets/logo.png.asset.json";
import { CONTACTS } from "./contacts";

const NAV = [
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#works" },
  { label: "Отзывы", href: "#reviews" },
  { label: "О компании", href: "#about" },
  { label: "Контакты", href: "#contacts" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex min-w-0 items-center gap-2">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-foreground">
            <img
              src={logoAsset.url}
              alt="S&M Electric — логотип электромонтажной компании"
              width={40}
              height={40}
              className="size-10 object-contain"
            />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight">
            Вольт<span className="text-brand">Про</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CONTACTS.phoneHref}
            className="hidden items-center gap-2 rounded-full bg-brand-soft px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-accent sm:flex"
          >
            <Phone className="size-4" />
            {CONTACTS.phoneDisplay}
          </a>
          <a
            href="#contacts"
            className="hidden rounded-full gradient-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-brand transition-transform hover:scale-[1.03] md:inline-flex"
          >
            Получить расчёт
          </a>
          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-border text-foreground lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contacts"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full gradient-brand px-4 py-3 text-center text-sm font-semibold text-brand-foreground"
            >
              Получить расчёт
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
