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
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24"
    >
      <Reveal>
        <SectionHeading eyebrow="Услуги" title={title} subtitle={subtitle} />
      </Reveal>

      <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => {
          const Icon = iconFor(service.icon);
          return (
            <Reveal as="article" key={service.id} delay={Math.min(i, 6) * 60}>
              <a
                href="#contacts"
                className="group flex h-full flex-col bg-card p-6 transition-colors hover:bg-secondary sm:p-7"
              >
                <span className="grid size-12 place-items-center rounded-md border border-border bg-background text-foreground transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold leading-tight">
                  {service.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.text}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
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
