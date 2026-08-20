import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, ListTree, Plus, ShieldCheck, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EQUIPMENT_TYPE_LABEL, type EquipmentType } from "@/lib/shape-library";
import type { SpecRow } from "@/lib/shape-library/spec-assemble";
import {
  assembleGroups,
  checkStructure,
  CHARGING_PANEL_GROUPS,
  GROUP_KIND_LABEL,
  type GroupKind,
  type LogicalNode,
  type PanelGroup,
} from "@/lib/shape-library/group-assemble";

const TYPES: EquipmentType[] = ["breaker", "rcd", "relay", "contactor", "terminal"];
const KINDS: GroupKind[] = ["input", "protection", "group", "reserve"];

let uid = 0;
const nid = (p: string) => `${p}${Date.now().toString(36)}${uid++}`;

/** ТЕСТ №3: логическая группировка щита. К рабочему проектировщику не подключено. */
export function GroupAssemblyTest() {
  const [groups, setGroups] = useState<PanelGroup[]>(CHARGING_PANEL_GROUPS);
  const [railModules, setRailModules] = useState(24);
  const [gap, setGap] = useState(1);
  const [checked, setChecked] = useState(false);

  const asm = useMemo(() => assembleGroups(groups, { railModules, gapModules: gap }), [groups, railModules, gap]);
  const checks = useMemo(() => checkStructure(groups, asm), [groups, asm]);

  const patchGroup = (id: string, patch: Partial<PanelGroup>) =>
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  const moveGroup = (id: string, dir: -1 | 1) =>
    setGroups((gs) => {
      const i = gs.findIndex((g) => g.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= gs.length) return gs;
      const next = gs.slice();
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  const addGroup = () =>
    setGroups((gs) => [
      ...gs,
      {
        id: nid("g"),
        kind: "group",
        name: `Группа ${gs.filter((g) => g.kind === "group").length + 1}`,
        description: "",
        reserveModules: 0,
        devices: [],
      },
    ]);

  const addDevice = (gid: string) =>
    patchGroupDevices(gid, (d) => [
      ...d,
      {
        id: nid("d"),
        manufacturer: "IEK",
        series: "ВА47-29 KARAT",
        model: "ВА47-29 1P",
        equipment_type: "breaker",
        poles: 1,
        nominal: 16,
        qty: 1,
      },
    ]);

  const patchGroupDevices = (gid: string, fn: (d: SpecRow[]) => SpecRow[]) =>
    setGroups((gs) => gs.map((g) => (g.id === gid ? { ...g, devices: fn(g.devices) } : g)));

  const updateDevice = (gid: string, did: string, patch: Partial<SpecRow>) =>
    patchGroupDevices(gid, (d) => d.map((r) => (r.id === did ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold">Тест группировки щита</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Спецификация → логические группы → оборудование групп → DIN-рейки → SVG-фигуры Visio →
          точки подключения → проводники → визуализация. Координаты рассчитываются алгоритмом,
          заменители фигур не рисуются. К рабочему проектировщику не подключено.
        </p>
      </header>

      {/* -------------------------------------------------------- параметры */}
      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
        <div className="w-40">
          <Label className="text-xs">Модулей в DIN-рейке</Label>
          <Input
            type="number"
            value={railModules}
            min={2}
            onChange={(e) => setRailModules(Number(e.target.value) || 2)}
          />
        </div>
        <div className="w-48">
          <Label className="text-xs">Резерв между группами, мод.</Label>
          <Input type="number" value={gap} min={0} onChange={(e) => setGap(Number(e.target.value) || 0)} />
        </div>
        <Button size="sm" onClick={addGroup}>
          <Plus className="mr-2 size-4" /> Группа
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setChecked((v) => !v)}>
          <ShieldCheck className="mr-2 size-4" /> Проверить структуру
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setGroups(CHARGING_PANEL_GROUPS)}>
          Тест «Щит зарядки — группировка»
        </Button>
      </div>

      {/* -------------------------------------------------------- сводка */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Групп" value={asm.totals.groups} />
        <Stat label="Аппаратов" value={asm.totals.devices} />
        <Stat label="Модулей" value={`${asm.totals.modules} + ${asm.totals.reserveModules} рез.`} />
        <Stat label="DIN-реек" value={asm.totals.rails} />
        <Stat label="Свободно мод." value={asm.totals.free} />
        <Stat label="Точек подключения" value={asm.totals.connectionPoints} />
      </div>

      {!!asm.warnings.length && (
        <ul className="space-y-1 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
          {asm.warnings.map((w, k) => (
            <li key={k} className="flex gap-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
              <span>{w.text}</span>
            </li>
          ))}
        </ul>
      )}

      {checked && (
        <section className="rounded-xl border bg-card p-4">
          <h3 className="mb-2 text-sm font-bold">Проверка структуры</h3>
          <ul className="space-y-1 text-sm">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-2">
                {c.ok ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-destructive" />
                )}
                <span>
                  {c.label} — <span className="text-muted-foreground">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* -------------------------------------------------------- редактор дерева */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <ListTree className="size-4" /> Структура щита
        </h3>
        {groups.map((g) => (
          <div key={g.id} className="rounded-xl border bg-card p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="w-36">
                <Label className="text-xs">Уровень</Label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={g.kind}
                  onChange={(e) => patchGroup(g.id, { kind: e.target.value as GroupKind })}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {GROUP_KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-44">
                <Label className="text-xs">Название</Label>
                <Input value={g.name} onChange={(e) => patchGroup(g.id, { name: e.target.value })} />
              </div>
              <div className="min-w-48 flex-1">
                <Label className="text-xs">Описание</Label>
                <Input
                  value={g.description}
                  onChange={(e) => patchGroup(g.id, { description: e.target.value })}
                />
              </div>
              <div className="w-28">
                <Label className="text-xs">Резерв, мод.</Label>
                <Input
                  type="number"
                  min={0}
                  value={g.reserveModules}
                  onChange={(e) => patchGroup(g.id, { reserveModules: Number(e.target.value) || 0 })}
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => moveGroup(g.id, -1)}>
                <ArrowUp className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => moveGroup(g.id, 1)}>
                <ArrowDown className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => addDevice(g.id)}>
                <Plus className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setGroups((gs) => gs.filter((x) => x.id !== g.id))}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>

            {!!g.devices.length && (
              <div className="mt-3 space-y-2">
                {g.devices.map((d) => (
                  <div key={d.id} className="flex flex-wrap items-end gap-2 rounded-lg border bg-background p-2">
                    <Field label="Производитель" w="w-28">
                      <Input value={d.manufacturer} onChange={(e) => updateDevice(g.id, d.id, { manufacturer: e.target.value })} />
                    </Field>
                    <Field label="Серия" w="w-36">
                      <Input value={d.series} onChange={(e) => updateDevice(g.id, d.id, { series: e.target.value })} />
                    </Field>
                    <Field label="Модель" w="w-44">
                      <Input value={d.model} onChange={(e) => updateDevice(g.id, d.id, { model: e.target.value })} />
                    </Field>
                    <Field label="Тип" w="w-44">
                      <select
                        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                        value={d.equipment_type}
                        onChange={(e) => updateDevice(g.id, d.id, { equipment_type: e.target.value as EquipmentType })}
                      >
                        {TYPES.map((t) => (
                          <option key={t} value={t}>
                            {EQUIPMENT_TYPE_LABEL[t]}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Полюса" w="w-20">
                      <Input
                        type="number"
                        value={d.poles ?? ""}
                        onChange={(e) => updateDevice(g.id, d.id, { poles: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Field>
                    <Field label="Номинал" w="w-20">
                      <Input
                        type="number"
                        value={d.nominal ?? ""}
                        onChange={(e) => updateDevice(g.id, d.id, { nominal: e.target.value ? Number(e.target.value) : null })}
                      />
                    </Field>
                    <Field label="Кол-во" w="w-20">
                      <Input
                        type="number"
                        min={1}
                        value={d.qty}
                        onChange={(e) => updateDevice(g.id, d.id, { qty: Math.max(1, Number(e.target.value) || 1) })}
                      />
                    </Field>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => patchGroupDevices(g.id, (arr) => arr.filter((x) => x.id !== d.id))}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* -------------------------------------------------------- визуализация */}
      <figure className="rounded-xl border bg-card p-3">
        <figcaption className="mb-2 text-sm font-semibold">
          Физическая раскладка по DIN-рейкам
          <span className="ml-2 font-normal text-muted-foreground">
            {asm.totals.devices} аппаратов · {asm.rails.length} рейк(и) · {asm.wires.length} проводников
          </span>
        </figcaption>
        <div
          className="overflow-auto rounded-lg bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: asm.svg }}
        />
      </figure>

      {/* -------------------------------------------------------- логическая схема */}
      <section className="rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-bold">Логическая схема</h3>
        {asm.tree ? <Tree node={asm.tree} depth={0} /> : <p className="text-sm text-muted-foreground">Структура пуста</p>}
      </section>

      {/* -------------------------------------------------------- отчёт */}
      <section className="overflow-x-auto rounded-xl border bg-card p-4">
        <h3 className="mb-2 text-sm font-bold">Размещение по группам</h3>
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-1">Группа</th>
              <th className="py-1">Уровень</th>
              <th className="py-1">Аппаратов</th>
              <th className="py-1">Модулей</th>
              <th className="py-1">Рейки</th>
              <th className="py-1">Целиком</th>
            </tr>
          </thead>
          <tbody>
            {asm.order.map((g) => {
              const spans = asm.spans.filter((s) => s.groupId === g.id);
              const items = asm.placed.filter((p) => p.groupId === g.id);
              return (
                <tr key={g.id} className="border-t">
                  <td className="py-1.5">{g.name}</td>
                  <td className="py-1.5">{GROUP_KIND_LABEL[g.kind]}</td>
                  <td className="py-1.5">{items.length}</td>
                  <td className="py-1.5">
                    {items.reduce((s, p) => s + p.modules, 0)}
                    {g.reserveModules ? ` + ${g.reserveModules} рез.` : ""}
                  </td>
                  <td className="py-1.5">{spans.map((s) => s.rail + 1).join(", ") || "—"}</td>
                  <td className="py-1.5">
                    {spans.length > 1 ? (
                      <X className="size-4 text-destructive" />
                    ) : (
                      <Check className="size-4 text-emerald-600" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Tree({ node, depth }: { node: LogicalNode; depth: number }) {
  return (
    <div style={{ paddingLeft: depth ? 18 : 0 }} className={depth ? "border-l" : ""}>
      <div className="py-0.5 text-sm">
        <span className="font-medium">{node.label}</span>
        {node.sub && <span className="ml-2 text-xs text-muted-foreground">{node.sub}</span>}
      </div>
      {node.children.map((c) => (
        <Tree key={c.id} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}

function Field({ label, w, children }: { label: string; w: string; children: React.ReactNode }) {
  return (
    <div className={w}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold">{value}</p>
    </div>
  );
}
