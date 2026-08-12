import logoAsset from "@/assets/logo.png.asset.json";
import { CONTACTS } from "./contacts";

const NAV = [
  { label: "Услуги", href: "#services" },
  { label: "Наши работы", href: "#works" },
  { label: "Цены", href: "#prices" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Контакты", href: "#contacts" },
];

export function Footer() {
  return (
    <footer className="border-t border-ink-border bg-ink pb-20 text-ink-foreground md:pb-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-sm bg-ink-elevated">
            <img
              src={logoAsset.url}
              alt="S&M Electric — логотип"
              width={40}
              height={40}
              loading="lazy"
              className="size-10 object-contain"
            />
          </span>
          <span className="text-base font-extrabold uppercase tracking-[0.14em]">
            S&amp;M Electric
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ink-muted transition-colors hover:text-brand"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <ul className="space-y-2 text-sm">
          <li>
            <a href={CONTACTS.phoneHref} className="font-bold hover:text-brand">
              {CONTACTS.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={CONTACTS.secondaryPhoneHref} className="text-ink-muted hover:text-brand">
              {CONTACTS.secondaryPhoneDisplay}
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACTS.email}`} className="text-ink-muted hover:text-brand">
              {CONTACTS.email}
            </a>
          </li>
          <li className="flex gap-4 pt-1">
            <a
              href={CONTACTS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted hover:text-brand"
            >
              WhatsApp
            </a>
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-muted hover:text-brand"
            >
              Telegram
            </a>
          </li>
        </ul>
      </div>

      <div className="border-t border-ink-border py-4">
        <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-center text-xs text-ink-muted sm:px-6">
          © {new Date().getFullYear()} S&amp;M Electric — электромонтаж в Санкт-Петербурге.
          <a href="/admin" className="hover:text-brand">
            Вход для администратора
          </a>
        </p>
      </div>
    </footer>
  );
}
