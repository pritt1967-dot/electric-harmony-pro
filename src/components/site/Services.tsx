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
import { SectionHeading } from "./SectionHeading";
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

function num(i: number) {
  return String(i + 1).padStart(2, "0");
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
  const [lead, ...rest] = services;

  return (
    <section
      id="services"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24"
    >
      <Reveal>
        <SectionHeading eyebrow="Услуги" title={title} subtitle={subtitle} />
      </Reveal>

      <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border lg:grid-cols-3">
        {lead && (
          <Reveal as="article" className="lg:col-span-2 lg:row-span-2">
            <a
              href="#contacts"
              className="group relative flex h-full flex-col justify-between gap-8 bg-ink p-7 text-ink-foreground sm:p-10"
            >
              <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" aria-hidden />
              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand">{num(0)}</span>
                  <span className="h-px w-10 bg-brand/50" aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ink-muted">
                    Основное направление
                  </span>
                </div>
                <h3 className="mt-6 max-w-lg text-2xl font-extrabold uppercase leading-tight sm:text-4xl">
                  {lead.title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
                  {lead.text}
                </p>
              </div>
              <div className="relative flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.06em] text-brand">
                  Рассчитать
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                {(() => {
                  const Icon = iconFor(lead.icon);
                  return <Icon className="size-12 text-ink-border sm:size-16" />;
                })()}
              </div>
            </a>
          </Reveal>
        )}

        {rest.map((service, i) => {
          const Icon = iconFor(service.icon);
          return (
            <Reveal as="article" key={service.id} delay={Math.min(i, 6) * 60}>
              <a
                href="#contacts"
                className="group flex h-full flex-col bg-card p-6 transition-colors hover:bg-secondary sm:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs font-bold text-brand">
                    {num(i + 1)}
                  </span>
                  <Icon className="size-6 text-muted-foreground transition-colors group-hover:text-brand" />
                </div>
                <h3 className="mt-5 text-base font-extrabold uppercase leading-tight tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.text}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 border-t border-border pt-4 text-xs font-bold uppercase tracking-[0.06em] text-foreground">
                  Рассчитать
                  <ArrowUpRight className="size-4 text-brand transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
