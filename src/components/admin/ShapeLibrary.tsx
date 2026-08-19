import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, FileCode2 } from "lucide-react";

import {
  SHAPE_LIBRARY,
  LIBRARY_STATS,
  EQUIPMENT_TYPE_LABEL,
  type LibraryItem,
} from "@/lib/shape-library";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function ShapePreview({ item }: { item: LibraryItem }) {
  return (
    <div
      className="grid h-40 place-items-center rounded-lg border border-border bg-white p-2 [&_svg]:max-h-36 [&_svg]:max-w-full"
      // SVG получен из реальной геометрии Visio на этапе сборки библиотеки.
      dangerouslySetInnerHTML={{ __html: item.svg }}
    />
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function ShapeLibrary() {
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SHAPE_LIBRARY;
    return SHAPE_LIBRARY.filter((i) =>
      [i.name, i.manufacturer, i.model, i.series, EQUIPMENT_TYPE_LABEL[i.equipment_type]]
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [q]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <FileCode2 className="size-4 text-brand" /> Тестовая библиотека фигур Visio
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Источник: {LIBRARY_STATS.source}. Графика извлечена из реальных Visio
          Master без перерисовки. К визуализатору щита не подключена.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Всего фигур: {LIBRARY_STATS.total}</Badge>
          <Badge variant="secondary">Готовы к визуализации: {LIBRARY_STATS.ready}</Badge>
          <Badge variant="secondary">Требуют ручной конвертации: {LIBRARY_STATS.manual}</Badge>
        </div>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск: производитель, модель, тип…"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.slug} className="rounded-xl border border-border bg-card p-3">
            <ShapePreview item={item} />
            <div className="mt-3 space-y-1.5">
              <div className="text-sm font-bold leading-tight">{item.name}</div>
              <Row label="Производитель" value={item.manufacturer} />
              <Row label="Серия" value={item.series} />
              <Row label="Тип" value={EQUIPMENT_TYPE_LABEL[item.equipment_type]} />
              <Row label="Полюсов" value={item.poles ? String(item.poles) : "—"} />
              <Row label="Модулей" value={item.modules ? String(item.modules) : "—"} />
              <Row
                label="Номинал"
                value={item.nominal_current ? `${item.nominal_current} А` : "—"}
              />
              <Row
                label="Габарит"
                value={`${item.width_mm} × ${item.height_mm} мм`}
              />
              <Row label="Точек подключения" value={String(item.connection_points.length)} />
              <Row label="Источник Visio" value={item.source_file} />
              <div className="text-[11px] text-muted-foreground">
                Master: {item.source_master}
              </div>
              {item.status === "ready" ? (
                <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="size-4" /> Готов к визуализации
                </div>
              ) : (
                <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-amber-600">
                  <AlertTriangle className="size-4" /> Требуется ручная конвертация
                </div>
              )}
              {item.note && (
                <p className="text-[11px] leading-snug text-muted-foreground">{item.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
