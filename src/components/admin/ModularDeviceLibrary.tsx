import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Lock, Boxes } from "lucide-react";

import {
  DEVICE_LIBRARY_STATS,
  DEVICE_MANUFACTURERS,
  DEVICE_TYPES,
  DEVICE_FORMATS,
  IMPORT_ERRORS,
  PROTECTED_ARCHIVES,
  NOT_IN_SOURCE,
  facets,
  filterDevices,
  libraryChecks,
  symbolOf,
  typeLabel,
  type PhysicalDevice,
} from "@/lib/shape-library/device-library";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PAGE = 24;
const svgCache = new Map<string, string>();

function useDeviceSvg(device: PhysicalDevice | null) {
  const [svg, setSvg] = useState<string | null>(
    device ? (svgCache.get(device.id) ?? null) : null,
  );
  useEffect(() => {
    if (!device || !device.hasSvg) return;
    const cached = svgCache.get(device.id);
    if (cached) {
      setSvg(cached);
      return;
    }
    let active = true;
    fetch(encodeURI(device.svgAsset))
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (!text.startsWith("<svg")) return;
        svgCache.set(device.id, text);
        if (active) setSvg(text);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [device]);
  return svg;
}

function DeviceShape({ device, className }: { device: PhysicalDevice; className?: string }) {
  const svg = useDeviceSvg(device);
  if (!device.hasSvg) {
    return (
      <div className={`grid place-items-center rounded-lg border border-dashed border-border text-[11px] text-muted-foreground ${className ?? ""}`}>
        Фигура отсутствует в источнике
      </div>
    );
  }
  return (
    <div
      className={`grid place-items-center overflow-hidden rounded-lg border border-border bg-white p-2 [&_svg]:max-h-full [&_svg]:max-w-full ${className ?? ""}`}
      // Исходная геометрия Visio-мастера, без перерисовки.
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  const shown = value === null || value === undefined || value === "" ? NOT_IN_SOURCE : value;
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="break-all text-right font-medium">{shown}</span>
    </div>
  );
}

function DeviceDialog({ device, onClose }: { device: PhysicalDevice | null; onClose: () => void }) {
  const symbol = device ? symbolOf(device) : undefined;
  return (
    <Dialog open={Boolean(device)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        {device && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base leading-snug">{device.model}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <DeviceShape device={device} className="h-56" />
              <div className="space-y-1.5">
                <Row label="Производитель" value={device.manufacturer} />
                <Row label="Серия (стенсил)" value={device.series} />
                <Row label="Модель" value={device.model} />
                <Row label="Артикул" value={device.article} />
                <Row label="Тип" value={typeLabel(device.deviceType)} />
                <Row label="Подтип" value={device.subType} />
                <Row label="Полюсность" value={device.poles ? `${device.poles}P` : null} />
                <Row
                  label="Номинал"
                  value={
                    device.ratedCurrent
                      ? `${device.curve ?? ""}${device.ratedCurrent} А`
                      : device.nominal
                  }
                />
                <Row
                  label="Ток утечки"
                  value={device.leakageCurrent ? `${device.leakageCurrent} мА` : null}
                />
                <Row label="Модулей DIN" value={device.modules} />
                <Row
                  label="Габарит"
                  value={device.width && device.height ? `${device.width} × ${device.height} мм` : null}
                />
                <Row label="Aspect ratio" value={device.aspectRatio} />
                <Row
                  label="Connection points"
                  value={
                    device.connectionPointsSource === "unavailable"
                      ? "unavailable (нет в исходном мастере)"
                      : device.connectionPoints
                          .map((p) => `${p.x_mm}×${p.y_mm}`)
                          .join(", ")
                  }
                />
                <Row label="physicalDeviceId" value={device.id} />
                <Row label="schematicSymbolId" value={device.schematicSymbolId} />
                <Row label="УГО из библиотеки №1" value={symbol?.name ?? null} />
                <Row label="Источник" value={device.sourceFile} />
                <Row label="Master ID" value={device.sourceMasterId} />
                <Row label="Формат" value={device.format.toUpperCase()} />
              </div>
            </div>
            {symbol && (
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs font-semibold">Связанное УГО (библиотека №1, не изменялась)</div>
                <div
                  className="mt-2 grid h-24 place-items-center rounded bg-white [&_svg]:max-h-20"
                  dangerouslySetInnerHTML={{ __html: symbol.svg }}
                />
              </div>
            )}
            {device.labelFields.length > 0 && (
              <div className="text-[11px] text-muted-foreground">
                Тексты Visio: {device.labelFields.join(" · ")}
              </div>
            )}
            {device.shapeData.length > 0 && (
              <div className="space-y-1 rounded-lg border border-border p-3">
                <div className="text-xs font-semibold">Shape Data (из источника)</div>
                {device.shapeData.map((d, i) => (
                  <Row key={i} label={d.label || d.key} value={d.value} />
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

const SPOT_VENDORS = ["ABB", "Schneider Electric", "EKF", "IEK", "Hager", "Legrand", "TimVisio"];

export function ModularDeviceLibrary() {
  const [q, setQ] = useState("");
  const [manufacturer, setManufacturer] = useState("all");
  const [deviceType, setDeviceType] = useState("all");
  const [series, setSeries] = useState("all");
  const [poles, setPoles] = useState("all");
  const [nominal, setNominal] = useState("all");
  const [modules, setModules] = useState("all");
  const [format, setFormat] = useState("all");
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<PhysicalDevice | null>(null);

  const base = useMemo(
    () => filterDevices({ manufacturer, deviceType }),
    [manufacturer, deviceType],
  );
  const f = useMemo(() => facets(base), [base]);
  const list = useMemo(
    () => filterDevices({ q, manufacturer, deviceType, series, poles, nominal, modules, format }),
    [q, manufacturer, deviceType, series, poles, nominal, modules, format],
  );

  useEffect(() => setLimit(PAGE), [q, manufacturer, deviceType, series, poles, nominal, modules, format]);

  const checks = libraryChecks();
  const spot = SPOT_VENDORS.map((v) => {
    const items = filterDevices({ manufacturer: v });
    return {
      vendor: v,
      total: items.length,
      withSvg: items.filter((d) => d.hasSvg).length,
      withCp: items.filter((d) => d.connectionPoints.length > 0).length,
      withModules: items.filter((d) => d.modules).length,
      linked: items.filter((d) => d.schematicSymbolId).length,
      sample: items[0],
    };
  });

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <Boxes className="size-4 text-brand" /> Библиотека №2 — модульные устройства
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Физические аппараты для раскладки на DIN-рейке. Источник — «Набор электрика для
          Visio» (4 архива объединены, дубликаты удалены по md5). Геометрия импортирована из
          исходных Visio-мастеров без перерисовки. Библиотека УГО (№1) не изменялась; связь
          выполняется через Unified Device Model. К рабочему визуализатору не подключена.
        </p>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {checks.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-1.5 text-xs"
            >
              <span className="text-muted-foreground">{c.label}</span>
              <span className={`font-bold ${c.warn ? "text-amber-600" : ""}`}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск: «EKF C16», «УЗО 40A», артикул…"
          className="sm:col-span-2 lg:col-span-4"
        />
        <Select value={manufacturer} onValueChange={setManufacturer}>
          <SelectTrigger><SelectValue placeholder="Производитель" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Все производители</SelectItem>
            {DEVICE_MANUFACTURERS.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={deviceType} onValueChange={setDeviceType}>
          <SelectTrigger><SelectValue placeholder="Категория" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Все категории</SelectItem>
            {DEVICE_TYPES.map((v) => (
              <SelectItem key={v} value={v}>{typeLabel(v)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={series} onValueChange={setSeries}>
          <SelectTrigger><SelectValue placeholder="Серия" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Все серии</SelectItem>
            {f.series.map((v) => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={poles} onValueChange={setPoles}>
          <SelectTrigger><SelectValue placeholder="Полюсность" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любая полюсность</SelectItem>
            {f.poles.map((v) => (
              <SelectItem key={v} value={String(v)}>{v}P</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={nominal} onValueChange={setNominal}>
          <SelectTrigger><SelectValue placeholder="Номинал" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Любой номинал</SelectItem>
            {f.nominals.map((v) => (
              <SelectItem key={v} value={String(v)}>{v} А</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={modules} onValueChange={setModules}>
          <SelectTrigger><SelectValue placeholder="Модули" /></SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Любое число модулей</SelectItem>
            {f.modules.map((v) => (
              <SelectItem key={v} value={String(v)}>{v} мод.</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger><SelectValue placeholder="Источник" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Любой формат</SelectItem>
            {DEVICE_FORMATS.map((v) => (
              <SelectItem key={v} value={v}>{v.toUpperCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-muted-foreground">
        Найдено устройств: <span className="font-bold text-foreground">{list.length}</span> из{" "}
        {DEVICE_LIBRARY_STATS.imported}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, limit).map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelected(d)}
            className="rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-brand"
          >
            <DeviceShape device={d} className="h-32" />
            <div className="mt-2 space-y-1">
              <div className="line-clamp-2 text-sm font-bold leading-tight">{d.model}</div>
              <div className="text-[11px] text-muted-foreground">
                {d.manufacturer} · {typeLabel(d.deviceType)}
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                {d.poles && <Badge variant="secondary">{d.poles}P</Badge>}
                {d.ratedCurrent && (
                  <Badge variant="secondary">
                    {d.curve ?? ""}
                    {d.ratedCurrent} А
                  </Badge>
                )}
                {d.leakageCurrent && <Badge variant="secondary">{d.leakageCurrent} мА</Badge>}
                {d.modules && <Badge variant="secondary">{d.modules} мод.</Badge>}
                {d.connectionPoints.length > 0 ? (
                  <Badge variant="secondary">CP: {d.connectionPoints.length}</Badge>
                ) : (
                  <Badge variant="outline">CP: unavailable</Badge>
                )}
                {d.schematicSymbolId && (
                  <Badge variant="outline">УГО: {d.schematicSymbolId.toUpperCase()}</Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {limit < list.length && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit((v) => v + PAGE * 2)}>
            Показать ещё ({list.length - limit})
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-sm font-bold">Контрольная проверка по производителям</div>
        <div className="mt-2 space-y-1.5">
          {spot.map((s) => (
            <div key={s.vendor} className="flex flex-wrap items-center gap-2 text-xs">
              {s.total > 0 ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="size-4 text-amber-600" />
              )}
              <span className="font-semibold">{s.vendor}</span>
              <span className="text-muted-foreground">
                устройств {s.total} · с SVG {s.withSvg} · с CP {s.withCp} · с модулями{" "}
                {s.withModules} · с УГО {s.linked}
              </span>
              {s.sample && (
                <span className="text-muted-foreground">— пример: {s.sample.model}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {IMPORT_ERRORS.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs dark:bg-amber-950/20">
          <div className="flex items-center gap-2 font-bold text-amber-700">
            <AlertTriangle className="size-4" /> Ошибки импорта: {IMPORT_ERRORS.length}
          </div>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {IMPORT_ERRORS.map((e) => (
              <li key={e.file}>
                {e.file} — {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <details className="rounded-xl border border-border bg-card p-4">
        <summary className="cursor-pointer text-sm font-bold">
          <Lock className="mr-1 inline size-4" /> Защищённые архивы: {PROTECTED_ARCHIVES.length}{" "}
          (status = protected_archive)
        </summary>
        <p className="mt-2 text-xs text-muted-foreground">
          Пароль не подбирался, файлы не изменялись и не удалялись. Обработаем отдельным этапом.
        </p>
        <ul className="mt-2 max-h-72 space-y-1 overflow-y-auto text-[11px] text-muted-foreground">
          {PROTECTED_ARCHIVES.map((a) => (
            <li key={a.file}>
              {a.vendor} — {a.name} ({a.size_kb} КБ)
            </li>
          ))}
        </ul>
      </details>

      <DeviceDialog device={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
