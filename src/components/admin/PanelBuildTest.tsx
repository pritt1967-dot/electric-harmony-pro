import { useMemo, useState } from "react";
import { AlertTriangle, Check, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildPanel,
  DEVICES_WITHOUT_SVG,
  GROUND_WAVE,
  ROLE_LABEL,
  TEST_SPEC_48,
  type SpecItem,
} from "@/lib/panel-build";

/**
 * ТЕСТ v2: автоматическая сборка физического щита из спецификации
 * (реальные SVG аппаратов, реальные модули, DIN-рейки, connection points, проводники).
 * К рабочему проектировщику НЕ подключено.
 */
export function PanelBuildTest() {
  const [spec] = useState<SpecItem[]>(TEST_SPEC_48);
  const [railModules, setRailModules] = useState(12);
  const [rails, setRails] = useState(4);
  const [reserve, setReserve] = useState(6);
  const [showPoints, setShowPoints] = useState(true);

  const build = useMemo(
    () => buildPanel(spec, { railModules, rails, reserveModules: reserve, showPoints }),
    [spec, railModules, rails, reserve, showPoints],
  );

  const download = () => {
    const blob = new Blob([build.svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "panel-build-test.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const t = build.totals;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold">Сборка щита из спецификации — тест v2</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Спецификация → поиск SVG аппарата → расчёт модулей DIN → размещение на рейках →
          подключение проводников к реальным точкам → визуализация. Отсутствующие фигуры
          показываются надписью «Фигура отсутствует в библиотеке». К основному проектировщику
          не подключено.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-card p-4">
        <div className="w-36">
          <Label className="text-xs">Модулей в рейке</Label>
          <Input type="number" min={4} value={railModules} onChange={(e) => setRailModules(Number(e.target.value) || 12)} />
        </div>
        <div className="w-28">
          <Label className="text-xs">DIN-реек</Label>
          <Input type="number" min={1} value={rails} onChange={(e) => setRails(Number(e.target.value) || 1)} />
        </div>
        <div className="w-36">
          <Label className="text-xs">Резерв, модулей</Label>
          <Input type="number" min={0} value={reserve} onChange={(e) => setReserve(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <Button size="sm" variant={showPoints ? "default" : "outline"} onClick={() => setShowPoints((v) => !v)}>
          Точки подключения
        </Button>
        <Button size="sm" variant="outline" onClick={download}>
          <Download className="mr-1 h-4 w-4" /> Скачать SVG
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Позиций", t.positions],
          ["Аппаратов", t.devices],
          ["Модулей / ёмкость", `${t.modules} / ${t.capacity}`],
          ["Резерв", `${t.reserve} мод.`],
          ["Точек подключения", `${t.connectionPoints} (Visio ${t.visioPoints})`],
          ["Проводников", t.wires],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="text-base font-semibold">{v}</div>
          </div>
        ))}
      </div>

      <div className="overflow-auto rounded-xl border bg-white p-3">
        <div className="min-w-[900px]" dangerouslySetInnerHTML={{ __html: build.svg }} />
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-3 text-sm font-semibold">Подбор фигур</div>
        <div className="divide-y text-sm">
          {build.resolutions.map((r) => (
            <div key={r.item.id} className="flex flex-wrap items-center gap-2 p-3">
              {r.device ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              )}
              <span className="font-mono text-xs">{r.item.tag}</span>
              <span className="text-muted-foreground">{ROLE_LABEL[r.item.role]}</span>
              <span className="font-medium">
                {r.device ? `${r.device.manufacturer} ${r.device.model}` : "Фигура отсутствует в библиотеке"}
              </span>
              <span className="text-xs text-muted-foreground">
                {r.reason}
                {r.candidates > 1 ? ` · похожих: ${r.candidates - 1}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 text-sm">
        <div className="font-semibold">Проверки библиотеки</div>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>
            «Земля волной»: {GROUND_WAVE ? "есть в библиотеке фигур" : "отсутствует — выводится предупреждение"}
          </li>
          <li>Записей без SVG (исключены из раскладки): {DEVICES_WITHOUT_SVG.length}</li>
          <li>
            Точки подключения: из Visio — {t.visioPoints}, рассчитано по геометрии — {t.derivedPoints}
          </li>
        </ul>
      </div>
    </div>
  );
}
