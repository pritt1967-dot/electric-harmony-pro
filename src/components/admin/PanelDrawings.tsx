import { useMemo, useState } from "react";
import { AlertTriangle, Download, FileDown, Printer, Ruler } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PanelDesign } from "@/lib/panel";
import { buildProject, validateProject } from "@/lib/drawings/project-model";
import { buildSingleLineSheets, type SheetFormat } from "@/lib/drawings/single-line";
import { buildAssemblySvg, layoutPanel } from "@/lib/drawings/assembly";
import { downloadPdf, downloadPng, downloadSvg, printSheets } from "@/lib/drawings/export";

type View = "scheme" | "panel";

export function PanelDrawings({
  design,
  title = "",
}: {
  design: PanelDesign;
  title?: string;
}) {
  const [view, setView] = useState<View>("scheme");
  const [format, setFormat] = useState<SheetFormat>("A3");
  const [busy, setBusy] = useState(false);

  const project = useMemo(() => buildProject(design, title), [design, title]);
  const issues = useMemo(() => validateProject(project), [project]);
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  const sheets = useMemo(
    () => (errors.length ? [] : buildSingleLineSheets(project, format)),
    [project, format, errors.length],
  );
  const assembly = useMemo(
    () => (errors.length ? "" : buildAssemblySvg(project)),
    [project, errors.length],
  );
  const layout = useMemo(() => layoutPanel(project), [project]);

  const current = view === "scheme" ? sheets : assembly ? [assembly] : [];
  const baseName =
    view === "scheme"
      ? `Однолинейная схема — ${project.title}`
      : `Визуализация щита — ${project.title}`;

  async function run(fn: () => Promise<void> | void) {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка экспорта");
    }
    setBusy(false);
  }

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Чертежи щита</h3>
          <p className="text-xs text-muted-foreground">
            Спецификация → электрическая логика → однолинейная схема → компоновка → визуализация
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view === "scheme" && (
            <div className="flex items-center gap-2">
              <Label className="text-xs">Формат</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as SheetFormat)}>
                <SelectTrigger className="h-8 w-[84px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["A4", "A3", "A2"] as SheetFormat[]).map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={busy || !current.length}
            onClick={() => run(() => downloadPdf(current, baseName))}
          >
            <FileDown className="mr-2 h-4 w-4" /> Скачать PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || !current.length}
            onClick={() =>
              run(async () => {
                for (let i = 0; i < current.length; i++)
                  await downloadPng(current[i]!, current.length > 1 ? `${baseName} (лист ${i + 1})` : baseName);
              })
            }
          >
            <Download className="mr-2 h-4 w-4" /> Скачать PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!current.length}
            onClick={() => downloadSvg(current[0]!, baseName)}
          >
            SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!current.length}
            onClick={() => printSheets(current, baseName)}
          >
            <Printer className="mr-2 h-4 w-4" /> Печать
          </Button>
        </div>
      </div>

      {!!errors.length && (
        <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" /> Чертежи не построены — исправьте ошибки проекта
          </div>
          <ul className="mt-2 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>• {e.text}</li>
            ))}
          </ul>
        </div>
      )}
      {!!warns.length && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {warns.map((wn, i) => (
            <li key={i}>⚠ {wn.text}</li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded border px-2 py-1">
          <Ruler className="mr-1 inline h-3 w-3" /> Корпус: {layout.total} мод.
        </span>
        <span className="rounded border px-2 py-1">Занято: {layout.used}</span>
        <span className="rounded border px-2 py-1">Резерв: {layout.reserve}</span>
        <span className="rounded border px-2 py-1">DIN-реек: {layout.rails.length}</span>
        <span className="rounded border px-2 py-1">Групп: {project.circuits.length}</span>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="mt-4">
        <TabsList>
          <TabsTrigger value="scheme">Однолинейная схема</TabsTrigger>
          <TabsTrigger value="panel">Визуализация щита</TabsTrigger>
        </TabsList>
        <TabsContent value="scheme" className="mt-3 space-y-4">
          {sheets.map((s, i) => (
            <div key={i} className="overflow-x-auto rounded-lg border bg-white p-2">
              <div
                className="[&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[900px]"
                dangerouslySetInnerHTML={{ __html: s }}
              />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="panel" className="mt-3">
          {assembly && (
            <div className="overflow-x-auto rounded-lg border bg-white p-2">
              <div
                className="[&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[900px]"
                dangerouslySetInnerHTML={{ __html: assembly }}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
