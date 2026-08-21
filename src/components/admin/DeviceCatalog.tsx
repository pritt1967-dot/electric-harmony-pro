import { useMemo, useState } from "react";
import { Boxes, Lock, FileWarning } from "lucide-react";

import {
  DEVICE_CATALOG_STATS,
  DEVICE_CATEGORIES,
  DEVICE_CATEGORY_LABELS,
  DEVICE_VENDORS,
  searchDeviceStencils,
  type DeviceStencil,
} from "@/lib/shape-library/device-catalog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function StencilRow({ s }: { s: DeviceStencil }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight">{s.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {s.vendor} · {DEVICE_CATEGORY_LABELS[s.category] ?? s.category} · {s.format.toUpperCase()} · {s.size_kb} КБ
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          <Badge variant="secondary">Фигур: {s.masters}</Badge>
          {s.locked && (
            <Badge variant="destructive" className="gap-1">
              <Lock className="size-3" /> архив с паролем
            </Badge>
          )}
          {s.error && (
            <Badge variant="destructive" className="gap-1">
              <FileWarning className="size-3" /> ошибка чтения
            </Badge>
          )}
        </div>
      </div>
      {s.texts.length > 0 && (
        <>
          <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => setOpen((v) => !v)}>
            {open ? "Скрыть номиналы и подписи" : `Номиналы и подписи (${s.text_total})`}
          </Button>
          {open && (
            <div className="mt-2 flex flex-wrap gap-1 rounded-lg bg-muted/50 p-2 text-[11px]">
              {s.texts.map((t) => (
                <span key={t} className="rounded bg-background px-1.5 py-0.5">
                  {t}
                </span>
              ))}
              {s.text_total > s.texts.length && (
                <span className="text-muted-foreground">…ещё {s.text_total - s.texts.length}</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function DeviceCatalog() {
  const [q, setQ] = useState("");
  const [vendor, setVendor] = useState("all");
  const [cat, setCat] = useState("all");
  const stats = DEVICE_CATALOG_STATS;
  const items = useMemo(() => searchDeviceStencils(q, vendor, cat), [q, vendor, cat]);
  const [limit, setLimit] = useState(60);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Boxes className="size-4 text-brand" /> Каталог библиотеки «Набор электрика для Visio»
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Четыре архива объединены логически в одну библиотеку: части 01–03 являются подмножеством
          полного архива, дубликаты удалены по контрольной сумме. Исходные файлы не изменялись.
          Это инвентаризация — геометрия ещё не импортирована, к рабочему визуализатору не подключено.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Стенсилов: {stats.stencils}</Badge>
          <Badge variant="secondary">Производителей: {stats.vendors}</Badge>
          <Badge variant="secondary">Категорий: {stats.categories}</Badge>
          <Badge variant="secondary">Фигур прочитано: {stats.masters}</Badge>
          <Badge variant="secondary">VSS: {stats.vss}</Badge>
          <Badge variant="secondary">VSSX: {stats.vssx}</Badge>
          <Badge variant={stats.locked ? "destructive" : "secondary"}>Под паролем (RAR): {stats.locked}</Badge>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-bold">Производители</div>
        <div className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {DEVICE_VENDORS.map((v) => (
            <button
              key={v.vendor}
              onClick={() => setVendor(v.vendor === vendor ? "all" : v.vendor)}
              className={`flex justify-between rounded-lg px-2 py-1 text-xs transition-colors ${
                vendor === v.vendor ? "bg-brand/10 font-semibold" : "hover:bg-muted"
              }`}
            >
              <span className="truncate">{v.vendor}</span>
              <span className="text-muted-foreground">
                {v.stencils} / {v.masters} фиг.{v.locked ? ` / ${v.locked}🔒` : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: ВА 47-63, УЗО, контактор, счётчик…" />
        <div className="flex flex-wrap gap-1.5">
          <Button size="sm" variant={cat === "all" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setCat("all")}>
            Все категории
          </Button>
          {DEVICE_CATEGORIES.map((c) => (
            <Button
              key={c.key}
              size="sm"
              variant={cat === c.key ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setCat(c.key)}
            >
              {c.label} ({c.stencils})
            </Button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          Найдено: {items.length} стенсилов
          {vendor !== "all" && ` · производитель: ${vendor}`}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {items.slice(0, limit).map((s) => (
          <StencilRow key={s.id} s={s} />
        ))}
      </div>
      {items.length > limit && (
        <Button variant="outline" className="w-full" onClick={() => setLimit((l) => l + 60)}>
          Показать ещё ({items.length - limit})
        </Button>
      )}
      {items.length === 0 && <p className="text-sm text-muted-foreground">Ничего не найдено.</p>}
    </div>
  );
}
