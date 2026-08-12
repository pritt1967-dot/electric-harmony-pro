import { Phone, Mail, MapPin, Clock } from "lucide-react";

import logoAsset from "@/assets/logo.png.asset.json";
import { CONTACTS } from "./contacts";

const NAV = [
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#works" },
  { label: "Отзывы", href: "#reviews" },
  { label: "О компании", href: "#about" },
  { label: "Контакты", href: "#contacts" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-border bg-ink pb-20 text-ink-foreground md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:py-16">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-ink-elevated">
              <img
                src={logoAsset.url}
                alt="S&M Electric — логотип электромонтажной компании"
                width={40}
                height={40}
                loading="lazy"
                className="size-10 object-contain"
              />
            </span>
            <span className="text-lg font-extrabold tracking-tight">S&amp;M Electric</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
            Электромонтаж в Санкт-Петербурге и Ленинградской области: монтаж
            электропроводки, сборка электрощитов, заземление и освещение.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
            Разделы
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-ink-muted transition-colors hover:text-brand"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
            Контакты
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" />
              <a href={CONTACTS.phoneHref} className="hover:text-brand">
                {CONTACTS.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-brand" />
              <a href={CONTACTS.secondaryPhoneHref} className="hover:text-brand">
                {CONTACTS.secondaryPhoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-brand" />
              <a href={`mailto:${CONTACTS.email}`} className="hover:text-brand">
                {CONTACTS.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              {CONTACTS.address}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-brand" />
              {CONTACTS.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-border py-5">
        <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 text-center text-xs text-ink-muted sm:px-6">
          © {new Date().getFullYear()} S&amp;M Electric — электрик и электромонтаж в
          Санкт-Петербурге. Все права защищены.
          <a href="/admin" className="hover:text-brand">
            Вход для администратора
          </a>
        </p>
      </div>
    </footer>
  );
}
