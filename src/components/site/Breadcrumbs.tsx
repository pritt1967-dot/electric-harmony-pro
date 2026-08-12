import { ChevronRight } from "lucide-react";

import type { Crumb } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 shrink-0 opacity-60" />}
              {last ? (
                <span className="text-foreground">{item.label}</span>
              ) : (
                <a href={item.href} className="transition-colors hover:text-brand">
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
