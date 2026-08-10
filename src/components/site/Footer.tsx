import { Phone, Mail, MapPin } from "lucide-react";

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
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-foreground">
              <img
                src={logoAsset.url}
                alt="S&M Electric — логотип электромонтажной компании"
                width={40}
                height={40}
                className="size-10 object-contain"
              />
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              S&M electric
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Электромонтаж в Санкт-Петербурге: монтаж электропроводки, сборка
            электрощитов, услуги электрика под ключ.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold">Разделы</h3>
          <ul className="mt-4 space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-brand"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold">Контакты</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-brand" />
              <a href={CONTACTS.phoneHref} className="hover:text-brand">
                {CONTACTS.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-brand" />
              <a href={CONTACTS.secondaryPhoneHref} className="hover:text-brand">
                {CONTACTS.secondaryPhoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-brand" />
              <a href={`mailto:${CONTACTS.email}`} className="hover:text-brand">
                {CONTACTS.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-brand" />
              {CONTACTS.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 px-4 text-center text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} S&M electric — электрик и электромонтаж в
          Санкт-Петербурге. Все права защищены.
          <a href="/admin" className="hover:text-brand">
            Вход для администратора
          </a>
        </p>
      </div>
    </footer>
  );
}
