import { useCallback, useEffect, useState } from "react";
import { FolderOpen, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/browser-client";
import type { PanelDesign } from "@/lib/panel";
import { PanelDesigner } from "@/components/admin/PanelDesigner";
import { PanelDrawings } from "@/components/admin/PanelDrawings";
import { SchematicEditor } from "@/components/admin/SchematicEditor";
import { ShapeLibrary } from "@/components/admin/ShapeLibrary";
import { SchematicSymbolLibrary } from "@/components/admin/SchematicSymbolLibrary";
import { DeviceCatalog } from "@/components/admin/DeviceCatalog";
import { ModularDeviceLibrary } from "@/components/admin/ModularDeviceLibrary";
import { AiCheckPanel } from "@/components/admin/AiCheckPanel";
import { snapshotFromDesign } from "@/lib/ai-check/from-design";

const SUB = [
  { value: "constructor", label: "Конструктор" },
  { value: "scheme", label: "Однолинейная схема" },
  { value: "scheme-lib", label: "Библиотека схемы" },
  { value: "devices", label: "Аппараты" },
  { value: "saved", label: "Щиты и шаблоны" },
];

type Session = { id: string; title: string; updated_at: string };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function PanelDesignHub() {
  const [mode, setMode] = useState<"design" | "check">("design");
  const [tab, setTab] = useState("constructor");
  const [current, setCurrent] = useState<{ design: PanelDesign | null; title: string }>({ design: null, title: "" });
  const [openReq, setOpenReq] = useState<{ id: string; nonce: number } | null>(null);
  const [labelReq, setLabelReq] = useState<{ mark: string; value: string; nonce: number } | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const onDesignChange = useCallback((d: { design: PanelDesign | null; title: string }) => setCurrent(d), []);

  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from("panel_designs")
      .select("id, title, updated_at")
      .not("title", "like", "\\_\\_cache\\_\\_%")
      .order("updated_at", { ascending: false });
    setSessions((data ?? []) as Session[]);
  }, []);
  useEffect(() => {
    if (tab === "saved") void loadSessions();
  }, [tab, loadSessions]);

  return (
    <div>
      <h2 className="text-lg font-bold">AI-конструктор щита</h2>
      <div className="mt-3 inline-flex rounded-lg border bg-card p-1">
        <Button size="sm" variant={mode === "design" ? "default" : "ghost"} onClick={() => setMode("design")}>Проектирование щита</Button>
        <Button size="sm" variant={mode === "check" ? "default" : "ghost"} onClick={() => setMode("check")}>Проверка готового щита</Button>
      </div>
      {mode === "check" && (
        <div className="mt-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            ИИ проверяет текущий щит из конструктора и только советует. Разрешено лишь переименование линии — после
            вашего подтверждения. Номиналы, кабели, PE/N/PEN и защита не меняются.
          </p>
          {current.design ? (
            <>
              <div className="text-sm font-medium">Щит: {current.title || "без названия"}</div>
              <AiCheckPanel
                getSnapshot={() => snapshotFromDesign(current.design!)}
                onApply={(ch) => {
                  if (ch.action === "set_label" && ch.key && ch.value)
                    setLabelReq({ mark: ch.key, value: ch.value, nonce: Date.now() });
                }}
              />
            </>
          ) : (
            <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              В конструкторе ещё нет рассчитанного щита.
              <div className="mt-3">
                <Button size="sm" variant="outline" onClick={() => { setMode("design"); setTab("constructor"); }}>Перейти в конструктор</Button>
              </div>
            </div>
          )}
        </div>

      )}
      <Tabs value={tab} onValueChange={setTab} className={mode === "design" ? "mt-3" : "hidden"}>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
          <TabsList className="flex h-auto w-max flex-nowrap gap-1 p-1">
            {SUB.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="min-h-9 shrink-0 whitespace-nowrap px-3">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Конструктор остаётся смонтированным, чтобы текущий щит не терялся при переключении вкладок */}
        <TabsContent value="constructor" forceMount className="mt-5 data-[state=inactive]:hidden">
          <PanelDesigner
            onDesignChange={onDesignChange}
            openRequest={openReq}
            labelRequest={labelReq}
            onSaved={() => void loadSessions()}
          />
        </TabsContent>

        <TabsContent value="scheme" className="mt-5 space-y-8">
          <Block title={`Схема текущего щита${current.title ? ` — ${current.title}` : ""}`}>
            {current.design ? (
              <PanelDrawings design={current.design} title={current.title} />
            ) : (
              <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                В конструкторе ещё нет рассчитанного щита. Рассчитайте или откройте щит во вкладке «Конструктор».
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => setTab("constructor")}>Перейти в конструктор</Button>
                </div>
              </div>
            )}
          </Block>
          <Block title="Редактор схемы (Visio)">
            <SchematicEditor />
          </Block>
        </TabsContent>

        <TabsContent value="scheme-lib" className="mt-5 space-y-8">
          <Block title="Библиотека УГО (VSS)"><SchematicSymbolLibrary /></Block>
          <Block title="Библиотека фигур"><ShapeLibrary /></Block>
        </TabsContent>

        <TabsContent value="devices" className="mt-5 space-y-8">
          <Block title="Каталог оборудования"><DeviceCatalog /></Block>
          <Block title="Модульные устройства"><ModularDeviceLibrary /></Block>
        </TabsContent>

        <TabsContent value="saved" className="mt-5 space-y-8">
          <Block title="Сохранённые щиты">
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={() => void loadSessions()}>
                <RefreshCw className="mr-2 size-4" /> Обновить
              </Button>
            </div>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Сохранённых щитов пока нет.</p>
            ) : (
              <ul className="divide-y rounded-xl border bg-card">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 p-3 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleString("ru-RU")}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOpenReq({ id: s.id, nonce: Date.now() });
                        setTab("constructor");
                      }}
                    >
                      <FolderOpen className="mr-2 size-4" /> Открыть
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Block>
        </TabsContent>
      </Tabs>
    </div>
  );
}
