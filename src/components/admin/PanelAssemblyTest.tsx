import { useMemo, useState } from "react";
import { AlertTriangle, Check, GitCompare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ORIGINAL_PANEL } from "@/lib/shape-library/original-panel";
import { assemblePanel, compareWithOriginal } from "@/lib/shape-library/assemble";

/** ТЕСТ: сравнение оригинального «Щит зарядки.vsdx» и сборки из библиотеки фигур. */
export function PanelAssemblyTest() {
  const [showCompare, setShowCompare] = useState(false);
  const assembly = useMemo(() => assemblePanel(), []);
  const cmp = useMemo(() => compareWithOriginal(assembly), [assembly]);

  const stats = ORIGINAL_PANEL.stats;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold">Тест визуализации — Щит зарядки</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Слева — оригинальный «{ORIGINAL_PANEL.source}» (эталон). Справа — щит, собранный
          алгоритмически из тестовой библиотеки фигур: реальные SVG Visio, реальные габариты в мм,
          модули, точки подключения. К рабочему проектировщику щита не подключено.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setShowCompare((v) => !v)}>
          <GitCompare className="mr-2 size-4" />
          {showCompare ? "Скрыть сравнение" : "Сравнить с оригиналом"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Размещено {assembly.placed.length} элемент(ов), точек подключения{" "}
          {assembly.connectionPoints}, проводников {assembly.wires.filter((w) => w.resolved).length}/
          {assembly.wires.length}
        </span>
      </div>

      {!!assembly.issues.length && (
        <ul className="space-y-1 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
          {assembly.issues.map((i, k) => (
            <li key={k} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <figure className="rounded-xl border bg-card p-3">
          <figcaption className="mb-2 text-sm font-semibold">
            Оригинал Visio — эталон
            <span className="ml-2 font-normal text-muted-foreground">
              {stats["instances"]} фигур · {stats["wires"]} проводов · {stats["connection_points"]}{" "}
              точек
            </span>
          </figcaption>
          <div
            className="overflow-auto rounded-lg bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: ORIGINAL_PANEL.svg }}
          />
        </figure>

        <figure className="rounded-xl border bg-card p-3">
          <figcaption className="mb-2 text-sm font-semibold">
            Автосборка из библиотеки фигур
            <span className="ml-2 font-normal text-muted-foreground">
              {assembly.placed.length} фигур · {assembly.rails.length} DIN-реек
            </span>
          </figcaption>
          <div
            className="overflow-auto rounded-lg bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: assembly.svg }}
          />
        </figure>
      </div>

      {showCompare && (
        <section className="space-y-4 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-bold">Технический отчёт теста</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-1">Показатель</th>
                  <th className="py-1">Оригинал</th>
                  <th className="py-1">Сборка</th>
                  <th className="py-1">Совпадение</th>
                </tr>
              </thead>
              <tbody>
                {cmp.rows.map((r) => (
                  <tr key={r.label} className="border-t">
                    <td className="py-1.5">{r.label}</td>
                    <td className="py-1.5">{r.original}</td>
                    <td className="py-1.5">{r.assembled}</td>
                    <td className="py-1.5">
                      {r.match ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <X className="size-4 text-destructive" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Block title="Несовпадение элементов" items={cmp.missing} />
          <Block title="Несовпадение размеров" items={cmp.sizeDiff} />
          <Block title="Несовпадение положения" items={cmp.posDiff} />
          <Block
            title="Отсутствующие точки подключения"
            items={cmp.missingConn ? [`${cmp.missingConn} точек нет в библиотечных фигурах`] : []}
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-1">Оборудование</th>
                  <th className="py-1">Модули</th>
                  <th className="py-1">Ширина, мм</th>
                  <th className="py-1">Точек</th>
                  <th className="py-1">Рейка</th>
                </tr>
              </thead>
              <tbody>
                {assembly.placed.map((p) => (
                  <tr key={p.instanceId} className="border-t">
                    <td className="py-1.5">{p.item.model}</td>
                    <td className="py-1.5">{p.item.modules ?? "—"}</td>
                    <td className="py-1.5">{p.w}</td>
                    <td className="py-1.5">{p.item.connection_points.length}</td>
                    <td className="py-1.5">{p.rail + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h4>
      {items.length ? (
        <ul className="mt-1 space-y-1 text-sm">
          {items.map((t, k) => (
            <li key={k}>• {t}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-emerald-600">Расхождений нет</p>
      )}
    </div>
  );
}
