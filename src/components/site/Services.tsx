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
  ArrowUpRight,
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
      className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-ink-foreground lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 right-[-10%] size-[520px] rounded-full bg-brand/10 blur-[140px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow tone="dark">Услуги</Eyebrow>
              <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
                  {subtitle}
                </p>
              )}
            </div>
            <a
              href="#contacts"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-ink-border px-6 text-sm font-semibold text-ink-foreground transition-colors hover:border-brand hover:text-brand"
            >
              Обсудить задачу <ArrowUpRight className="size-4" />
            </a>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {services.map((service, i) => {
            const Icon = iconFor(service.icon);
            return (
              <Reveal as="li" key={service.id} delay={Math.min(i, 8) * 60}>
                <a
                  href="#contacts"
                  className="card-ink group flex h-full flex-col p-6 sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-brand/12 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-ink-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold leading-tight tracking-tight">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                    {service.text}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                    Подробнее
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
