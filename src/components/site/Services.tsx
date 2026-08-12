import {
  Cable,
  LayoutGrid,
  Lightbulb,
  PlugZap,
  Home,
  Wrench,
  Zap,
  ShieldCheck,
  Power,
  Settings,
  Plug,
  Fan,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";
import type { ServiceRow } from "@/lib/content.functions";

export const SERVICE_ICONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "cable", label: "Кабель", Icon: Cable },
  { key: "layout-grid", label: "Щит", Icon: LayoutGrid },
  { key: "lightbulb", label: "Освещение", Icon: Lightbulb },
  { key: "plug-zap", label: "Розетка+", Icon: PlugZap },
  { key: "home", label: "Дом", Icon: Home },
  { key: "wrench", label: "Ремонт", Icon: Wrench },
  { key: "zap", label: "Молния", Icon: Zap },
  { key: "shield-check", label: "Гарантия", Icon: ShieldCheck },
  { key: "power", label: "Питание", Icon: Power },
  { key: "settings", label: "Настройка", Icon: Settings },
  { key: "plug", label: "Вилка", Icon: Plug },
  { key: "fan", label: "Вентиляция", Icon: Fan },
];

const ICON_MAP = new Map(SERVICE_ICONS.map((s) => [s.key, s.Icon]));

export function iconFor(key: string): LucideIcon {
  return ICON_MAP.get(key) ?? Wrench;
}

export function Services({
  services,
  title,
  subtitle,
}: {
  services: ServiceRow[];
  title: string;
  subtitle: string;
}) {
  return (
    <section
      id="services"
      className="relative scroll-mt-20 overflow-hidden bg-ink py-16 text-ink-foreground lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Услуги</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
              {subtitle}
            </p>
          )}
        </Reveal>

        <ul className="mt-10 border-t border-ink-border">
          {services.map((service, i) => (
            <Reveal as="li" key={service.id} delay={Math.min(i, 6) * 40}>
              <a
                href="#contacts"
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-ink-border py-5 transition-colors hover:bg-ink-elevated sm:gap-x-8 sm:py-7 lg:grid-cols-[auto_minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
              >
                <span className="font-mono text-[11px] font-bold text-ink-muted transition-colors group-hover:text-brand sm:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold leading-tight tracking-tight sm:text-2xl">
                  {service.title}
                </h3>
                <p className="col-start-2 max-w-xl text-sm leading-relaxed text-ink-muted lg:col-start-3">
                  {service.text}
                </p>
                <span
                  aria-hidden
                  className="col-start-3 row-start-1 justify-self-end text-lg text-ink-muted transition-all group-hover:translate-x-1 group-hover:text-brand lg:col-start-4"
                >
                  →
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
