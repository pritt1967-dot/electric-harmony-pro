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
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <Reveal className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand">
          Услуги
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const Icon = iconFor(service.icon);
          return (
            <Reveal as="article" key={service.id} delay={i * 70}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-brand">
                <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:gradient-brand group-hover:text-brand-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{service.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{service.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
