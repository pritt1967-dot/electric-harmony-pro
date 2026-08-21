import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, GitCompare, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  assembleFromSpec,
  compareSpecWithOriginal,
  CHARGING_PANEL_SPEC,
  UNIFIED_DEMO_SPEC,
  modulesOf,
  type SpecRow,
  type SpecWire,
} from "@/lib/shape-library/spec-assemble";
import { buildUnifiedProject, modelWires } from "@/lib/shape-library/unified-model";
import { buildSingleLine } from "@/lib/shape-library/single-line-build";
import { compareWithDoc1, verifyProject } from "@/lib/shape-library/verify";
import { EQUIPMENT_TYPE_LABEL, type EquipmentType } from "@/lib/shape-library";


const TYPES: (EquipmentType | "")[] = ["", "breaker", "rcd", "relay", "contactor", "terminal"];

const EMPTY: Omit<SpecRow, "id"> = {
  manufacturer: "",
  series: "",
  model: "",
  equipment_type: "breaker",
  poles: null,
  nominal: null,
  qty: 1,
};

/** ТЕСТ №2: сборка щита из спецификации на реальных фигурах библиотеки Visio. */
export function SpecAssemblyTest() {
  const [spec, setSpec] = useState<SpecRow[]>(CHARGING_PANEL_SPEC);
  const [railModules, setRailModules] = useState(48);
  const [reserve, setReserve] = useState(0);
  const [wires, setWires] = useState<SpecWire[]>([]);
  const [pick, setPick] = useState<{ key: string; conn: string } | null>(null);
  const [showCompare, setShowCompare] = useState(false);

  const asm = useMemo(
    () => assembleFromSpec(spec, { railModules, reserveModules: reserve }, wires),
    [spec, railModules, reserve, wires],
  );
  const cmp = useMemo(() => compareSpecWithOriginal(asm), [asm]);

  /** Единая модель: одна спецификация → логика → однолинейная схема → щит. */
  const model = useMemo(() => {
    const draft = buildUnifiedProject(spec, {
      railModules,
      reserveModules: reserve,
      title: "Тест сборки из спецификации",
    });
    return buildUnifiedProject(
      spec,
      { railModules, reserveModules: reserve, title: "Тест сборки из спецификации" },
      modelWires(draft),
    );
  }, [spec, railModules, reserve]);
  const single = useMemo(() => buildSingleLine(model), [model]);
  const checks = useMemo(() => verifyProject(model), [model]);
  const doc1 = useMemo(() => compareWithDoc1(model, single), [model, single]);


  const update = (id: string, patch: Partial<SpecRow>) =>
    setSpec((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const move = (id: string, dir: -1 | 1) =>
    setSpec((s) => {
      const i = s.findIndex((r) => r.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = s.slice();
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const addWire = (key: string, conn: string) => {
    if (!pick) return setPick({ key, conn });
    if (pick.key === key && pick.conn === conn) return setPick(null);
    setWires((w) => [...w, { id: `w${w.length + 1}`, from: pick, to: { key, conn } }]);
    setPick(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold">Тест сборки из спецификации</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Спецификация → библиотека фигур Visio → модули → DIN-рейки → точки подключения →
          проводники → визуализация. Заменители не рисуются. К рабочему проектировщику не
          подключено.
        </p>
      </header>

      {/* --------------------------------------------------------- параметры */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
        <div className="w-40">
          <Label className="text-xs">Модулей в DIN-рейке</Label>
          <Input
            type="number"
            min={2}
            value={railModules}
            onChange={(e) => setRailModules(Number(e.target.value) || 48)}
          />
        </div>
        <div className="w-44">
          <Label className="text-xs">Резерв между группами, мод.</Label>
          <Input
            type="number"
            min={0}
            value={reserve}
            onChange={(e) => setReserve(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
        <Button size="sm" variant="outline" onClick={() => setSpec(CHARGING_PANEL_SPEC)}>
          Тестовая спецификация «Щит зарядки — тест №2»
        </Button>
        <Button size="sm" variant="outline" onClick={() => setSpec(UNIFIED_DEMO_SPEC)}>
          Демо «СПЕЦ → СХЕМА → ЩИТ»
        </Button>

        <Button size="sm" onClick={() => setShowCompare((v) => !v)}>
          <GitCompare className="mr-2 size-4" />
          {showCompare ? "Скрыть сравнение" : "Сравнить с эталоном"}
        </Button>
      </div>

      {/* ------------------------------------------------------ спецификация */}
      <section className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">Спецификация</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSpec((s) => [...s, { ...EMPTY, id: `s${Date.now()}` }])}
          >
            <Plus className="mr-2 size-4" /> Позиция
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-1">Производитель</th>
                <th className="py-1">Серия</th>
                <th className="py-1">Модель</th>
                <th className="py-1">Тип</th>
                <th className="py-1">Полюса</th>
                <th className="py-1">Номинал</th>
                <th className="py-1">Кол-во</th>
                <th className="py-1">Фигура</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {spec.map((r) => {
                const m = asm.matches.find((x) => x.row.id === r.id);
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="py-1 pr-2">
                      <Input value={r.manufacturer} onChange={(e) => update(r.id, { manufacturer: e.target.value })} />
                    </td>
                    <td className="py-1 pr-2">
                      <Input value={r.series} onChange={(e) => update(r.id, { series: e.target.value })} />
                    </td>
                    <td className="py-1 pr-2">
                      <Input value={r.model} onChange={(e) => update(r.id, { model: e.target.value })} />
                    </td>
                    <td className="py-1 pr-2">
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        value={r.equipment_type}
                        onChange={(e) => update(r.id, { equipment_type: e.target.value as EquipmentType | "" })}
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t ? EQUIPMENT_TYPE_LABEL[t] : "— любой —"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1 pr-2">
                      <Input
                        className="w-20"
                        type="number"
                        value={r.poles ?? ""}
                        onChange={(e) => update(r.id, { poles: e.target.value ? Number(e.target.value) : null })}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <Input
                        className="w-24"
                        type="number"
                        value={r.nominal ?? ""}
                        onChange={(e) => update(r.id, { nominal: e.target.value ? Number(e.target.value) : null })}
                      />
                    </td>
                    <td className="py-1 pr-2">
                      <Input
                        className="w-20"
                        type="number"
                        min={1}
                        value={r.qty}
                        onChange={(e) => update(r.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                      />
                    </td>
                    <td className="max-w-[220px] py-2 pr-2 text-xs">
                      {m?.item ? (
                        <span className="text-emerald-600">
                          {m.item.model} · {modulesOf(m.item)} мод. · {m.item.connection_points.length} точек
                          <span className="block text-muted-foreground">{m.reason}</span>
                        </span>
                      ) : (
                        <span className="text-amber-600">⚠️ Фигура отсутствует в библиотеке — {m?.reason}</span>
                      )}
                    </td>
                    <td className="py-1">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => move(r.id, -1)}>
                          <ArrowLeft className="size-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => move(r.id, 1)}>
                          <ArrowRight className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSpec((s) => s.filter((x) => x.id !== r.id))}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------- проверка */}
      <section className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Позиций спецификации" value={asm.totals.positions} />
        <Stat label="Аппаратов" value={asm.totals.devices} />
        <Stat label="Всего модулей" value={asm.totals.modules} />
        <Stat label="Свободно модулей" value={asm.totals.free} />
        <Stat label="Недостаточно места" value={asm.totals.overflow ? "Да (перенос на рейки)" : "Нет"} />
        <Stat label="Отсутствующих фигур" value={asm.missing.length} />
      </section>

      {!!asm.missing.length && (
        <ul className="space-y-1 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
          {asm.missing.map((m) => (
            <li key={m.row.id} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
              <span>
                ⚠️ Фигура отсутствует в библиотеке: {m.row.manufacturer} {m.row.model} — {m.reason}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* ----------------------------------------------------- визуализация */}
      <figure className="rounded-xl border bg-card p-3">
        <figcaption className="mb-2 text-sm font-semibold">
          Автосборка из спецификации
          <span className="ml-2 font-normal text-muted-foreground">
            {asm.rails.length} DIN-рейк(и) · {asm.totals.connectionPoints} точек подключения ·{" "}
            {asm.wirePoints.filter((w) => w.ok).length} проводник(ов)
          </span>
        </figcaption>
        <div
          className="overflow-auto rounded-lg bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: asm.svg }}
        />
        <div className="mt-2 text-xs text-muted-foreground">
          Модули по рейкам:{" "}
          {asm.rails.map((r) => `рейка ${r.index + 1}: ${r.used}/${r.modules}`).join(" · ")}
        </div>
      </figure>

      {/* -------------------------------------------------------- проводники */}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="text-sm font-bold">
          Проводники по точкам подключения
          {pick && (
            <span className="ml-2 text-xs font-normal text-brand">
              выбрана точка {pick.conn} — укажите вторую
            </span>
          )}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Выберите точку подключения одного аппарата, затем другого. Провод строится строго от
          connection point к connection point и перестраивается при изменении раскладки.
        </p>

        <div className="mt-3 space-y-2">
          {asm.placed.map((p) => (
            <div key={p.key} className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="w-56 shrink-0 font-medium">
                {p.item.model} <span className="text-muted-foreground">(рейка {p.rail + 1})</span>
              </span>
              {p.item.connection_points.map((c) => {
                const active = pick?.key === p.key && pick.conn === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => addWire(p.key, c.id)}
                    title={`${c.id}: x=${c.x_mm} мм, y=${c.y_mm} мм (в системе фигуры)`}
                    className={`rounded border px-1.5 py-0.5 ${
                      active ? "border-brand bg-brand/10 text-brand" : "border-border hover:bg-muted"
                    }`}
                  >
                    {c.id}
                  </button>
                );
              })}
              {!p.item.connection_points.length && (
                <span className="text-amber-600">точек подключения нет в исходном Visio</span>
              )}
            </div>
          ))}
        </div>

        {!!wires.length && (
          <ul className="mt-3 space-y-1 text-xs">
            {wires.map((w) => (
              <li key={w.id} className="flex items-center gap-2">
                <span>
                  {w.id}: {w.from.key} · {w.from.conn} → {w.to.key} · {w.to.conn}
                </span>
                <button
                  className="text-destructive"
                  onClick={() => setWires((s) => s.filter((x) => x.id !== w.id))}
                >
                  удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ---------------------------------------------------------- сравнение */}
      {showCompare && (
        <section className="space-y-3 rounded-xl border bg-card p-4">
          <h3 className="text-sm font-bold">
            Сравнение с эталоном «Щит зарядки.vsdx» — совпадение {cmp.percent}%
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-1">Показатель</th>
                  <th className="py-1">Эталон</th>
                  <th className="py-1">Сборка из спецификации</th>
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
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
}
