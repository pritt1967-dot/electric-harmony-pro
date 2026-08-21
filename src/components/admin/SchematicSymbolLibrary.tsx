import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Library } from "lucide-react";

import {
  SCHEMATIC_CATEGORY_LIST,
  SCHEMATIC_CATEGORY_LABEL,
  SCHEMATIC_LIBRARY_STATS,
  schematicLibraryIssues,
  schematicLibraryReadiness,
  searchSchematicSymbols,
  duplicateGroups,
  type SchematicSymbol,
} from "@/lib/shape-library/schematic-library";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SymbolCard({ s }: { s: SchematicSymbol }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div
        className="grid h-32 place-items-center rounded-lg border border-border bg-white p-2 [&_svg]:max-h-28 [&_svg]:max-w-full"
        // Геометрия получена из мастеров VSS на этапе сборки библиотеки.
        dangerouslySetInnerHTML={{ __html: s.svg }}
      />
      <div className="mt-3 space-y-1.5">
        <div className="text-sm font-bold leading-tight">{s.name}</div>
        <Row label="ID библиотеки" value={s.id} />
        <Row label="Категория" value={SCHEMATIC_CATEGORY_LABEL[s.category] ?? s.category} />
        <Row label="Master ID (Visio)" value={s.master_id ?? "нет в Документ1.vsdx"} />
        <Row label="Shape ID (VSS)" value={`#${s.shape_id}`} />
        <Row label="Габарит" value={`${s.width_mm} × ${s.height_mm} мм`} />
        <Row label="Aspect ratio" value={s.aspect_ratio ? s.aspect_ratio.toFixed(3) : "—"} />
        <Row label="Контуров геометрии" value={String(s.paths)} />
        <Row
          label="Точек подключения"
          value={`${s.connection_points.length} (${
            s.conn_source === "visio-master" ? "из Visio" : s.conn_source === "geometry" ? "по геометрии" : "нет"
          })`}
        />
        <Row label="Текстовые поля" value={s.texts.length ? s.texts.join(", ") : "—"} />
        <Row label="Свойства" value={s.props.length ? String(s.props.length) : "—"} />
        <div className="text-[11px] text-muted-foreground">Master: {s.source_master}</div>
        <Button size="sm" variant="outline" className="mt-1 h-7 w-full text-xs" onClick={() => setOpen((v) => !v)}>
          {open ? "Скрыть детали" : "Детали: точки и свойства"}
        </Button>
        {open && (
          <div className="space-y-2 rounded-lg bg-muted/50 p-2 text-[11px]">
            <div>
              <div className="font-semibold">Connection points, мм</div>
              {s.connection_points.length ? (
                <ul className="mt-0.5 space-y-0.5">
                  {s.connection_points.map((p) => (
                    <li key={p.id}>
                      {p.id}: x {p.x_mm} / y {p.y_mm} — {p.source === "visio-master" ? "Visio" : "геометрия"}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground">нет</div>
              )}
            </div>
            <div>
              <div className="font-semibold">Пользовательские свойства</div>
              {s.props.length ? (
                <ul className="mt-0.5 space-y-0.5">
                  {s.props.map((p) => (
                    <li key={p.key}>
                      {p.label || p.key}: {p.value || "—"}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted-foreground">нет в исходном Visio</div>
              )}
            </div>
            {s.errors.length > 0 && (
              <ul className="space-y-0.5 text-amber-600">
                {s.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function SchematicSymbolLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const items = useMemo(() => searchSchematicSymbols(q, cat), [q, cat]);
  const stats = SCHEMATIC_LIBRARY_STATS;
  const issues = useMemo(() => schematicLibraryIssues(), []);
  const readiness = useMemo(() => schematicLibraryReadiness(), []);
  const dups = useMemo(() => duplicateGroups(), []);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Library className="size-4 text-brand" /> Библиотека №1 — УГО однолинейной схемы
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Источник: {stats.sourceVss} — импортированы ВСЕ мастера. Эталон построения
          и оформления схемы: {stats.referenceDoc} (из него взяты точные точки
          подключения и свойства для встречающихся там фигур). Физические SVG
          модульных аппаратов сюда не входят — это отдельная библиотека №2.
          К рабочему визуализатору не подключена.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary">Мастеров в VSS: {stats.vssMasters}</Badge>
          <Badge variant="secondary">Импортировано: {stats.imported}</Badge>
          <Badge variant="secondary">Категорий: {stats.categories}</Badge>
          <Badge variant="secondary">Точек подключения: {stats.connectionPoints}</Badge>
          <Badge variant="secondary">Точки из Visio: {stats.withVisioConns}</Badge>
          <Badge variant="secondary">Точки по геометрии: {stats.withGeometryConns}</Badge>
          <Badge variant="secondary">С текстами: {stats.withTexts}</Badge>
          <Badge variant="secondary">Со свойствами: {stats.withProps}</Badge>
          <Badge variant="secondary">Дубликатов: {dups.length}</Badge>
          <Badge variant={stats.hasPI ? "default" : "destructive"}>
            PI: {stats.hasPI ? `найден (${stats.piId})` : "не найден"}
          </Badge>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
          {readiness.ready ? (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="size-4" /> Библиотека готова к использованию в будущих проектах
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="size-4" /> Есть замечания: ошибок {errors.length}
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-bold">Отчёт импорта</div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          <Row label="Ошибки (пустая геометрия)" value={String(errors.length)} />
          <Row label="Предупреждения" value={String(warnings.length)} />
          <Row label="Без точек подключения" value={String(stats.withoutConns)} />
          <Row label="Без текстовых полей" value={String(stats.imported - stats.withTexts)} />
        </div>
        {(errors.length > 0 || warnings.length > 0) && (
          <ul className="mt-3 max-h-52 space-y-1 overflow-auto text-[11px]">
            {[...errors, ...warnings].slice(0, 120).map((i, idx) => (
              <li key={`${i.id}-${idx}`} className="flex gap-1.5">
                {i.level === "error" ? (
                  <XCircle className="mt-0.5 size-3 shrink-0 text-destructive" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                )}
                <span>
                  <b>{i.name}</b> — {i.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск: QF, УЗО, PI, счётчик…" />
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={cat === "all" ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setCat("all")}
          >
            Все ({stats.imported})
          </Button>
          {SCHEMATIC_CATEGORY_LIST.map((c) => (
            <Button
              key={c.key}
              size="sm"
              variant={cat === c.key ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => setCat(c.key)}
            >
              {c.label} ({searchSchematicSymbols("", c.key).length})
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <SymbolCard key={s.id} s={s} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Ничего не найдено по запросу.</p>
      )}
    </div>
  );
}
