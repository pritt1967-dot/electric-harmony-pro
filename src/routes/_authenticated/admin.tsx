import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { Toaster } from "sonner";

import { LOGO_URL } from "@/lib/logo";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextsEditor } from "@/components/admin/TextsEditor";
import { ServicesEditor } from "@/components/admin/ServicesEditor";
import { ProjectsEditor } from "@/components/admin/ProjectsEditor";
import { ReviewsEditor } from "@/components/admin/ReviewsEditor";
import { SubmissionsEditor } from "@/components/admin/SubmissionsEditor";
import { PriceEditor } from "@/components/admin/PriceEditor";
import { EstimatesList } from "@/components/admin/EstimatesList";
import { OrdersList } from "@/components/admin/OrdersList";
import { PanelDesigner } from "@/components/admin/PanelDesigner";
import { SchematicEditor } from "@/components/admin/SchematicEditor";
import { ShapeLibrary } from "@/components/admin/ShapeLibrary";
import { SchematicSymbolLibrary } from "@/components/admin/SchematicSymbolLibrary";
import { DeviceCatalog } from "@/components/admin/DeviceCatalog";
import { PanelAssemblyTest } from "@/components/admin/PanelAssemblyTest";
import { SpecAssemblyTest } from "@/components/admin/SpecAssemblyTest";
import { GroupAssemblyTest } from "@/components/admin/GroupAssemblyTest";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const TABS = [
  { value: "submissions", label: "Заявки" },
  { value: "estimates", label: "Сметы" },
  { value: "orders", label: "Заказы" },
  { value: "price", label: "Прайс" },
  { value: "panel", label: "Проектировщик щита" },
  { value: "schematic", label: "Схема (Visio)" },
  { value: "shapes", label: "Библиотека фигур" },
  { value: "ugo-library", label: "Библиотека УГО (VSS)" },
  { value: "device-catalog", label: "Каталог оборудования" },
  { value: "assembly-test", label: "Тест сборки щита" },
  { value: "spec-test", label: "Тест сборки из спецификации" },
  { value: "group-test", label: "Тест группировки щита" },
  { value: "texts", label: "Тексты" },
  { value: "services", label: "Услуги" },
  { value: "works", label: "Работы" },
  { value: "reviews", label: "Отзывы" },
];

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const claim = useServerFn(claimAdmin);
  const [tab, setTab] = useState("submissions");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"checking" | "admin" | "denied">(
    "checking",
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roles) {
        if (active) setStatus("admin");
        return;
      }
      // Try to bootstrap the first admin.
      try {
        const res = await claim({});
        if (active) setStatus(res.granted ? "admin" : "denied");
      } catch {
        if (active) setStatus("denied");
      }
    })();
    return () => {
      active = false;
    };
  }, [claim]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { next: undefined }, replace: true });
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-secondary/30">
      <Toaster richColors position="top-center" />
      <header className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-3 sm:flex sm:justify-between sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-foreground">
              <img
                src={LOGO_URL}
                alt="S&M Electric — логотип"
                width={32}
                height={32}
                className="size-8 object-contain"
              />
            </span>
            <span className="truncate text-sm font-extrabold tracking-tight sm:text-base">
              S&M electric{" "}
              <span className="font-medium text-muted-foreground">/ Админка</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button variant="outline" size="sm" className="px-2 sm:px-3" asChild>
              <Link to="/">
                <ExternalLink className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Сайт</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={signOut}>
              <LogOut className="size-4 sm:mr-2" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {status === "checking" && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-8 animate-spin text-brand" />
          </div>
        )}

        {status === "denied" && (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center">
            <ShieldAlert className="mx-auto size-10 text-destructive" />
            <h2 className="mt-4 text-lg font-bold">Нет доступа</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              У вашего аккаунта нет прав администратора. Обратитесь к владельцу
              сайта или войдите под другим аккаунтом.
            </p>
            <Button variant="outline" className="mt-5" onClick={signOut}>
              <LogOut className="mr-2 size-4" /> Выйти
            </Button>
          </div>
        )}

        {status === "admin" && (
          <>
            <h1 className="whitespace-nowrap text-xl font-extrabold tracking-tight sm:text-2xl">
              Управление контентом
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Изменения появляются на сайте сразу после сохранения.
            </p>

            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v);
                requestAnimationFrame(() => {
                  tabsRef.current
                    ?.querySelector(`[data-value="${v}"]`)
                    ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
                });
              }}
              className="mt-4 sm:mt-6"
            >
              <div
                ref={tabsRef}
                className="-mx-4 overflow-x-auto overflow-y-hidden px-4 scrollbar-hide sm:mx-0 sm:px-0"
              >
                <TabsList className="flex h-auto w-max flex-nowrap items-center justify-start gap-2 rounded-2xl p-1.5 sm:h-9 sm:gap-1 sm:rounded-lg sm:p-1">
                  {TABS.map((t) => (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      data-value={t.value}
                      className="min-h-9 shrink-0 whitespace-nowrap rounded-xl px-3.5 transition-colors sm:min-h-0 sm:rounded-md sm:px-3"
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="submissions" className="mt-6">
                <SubmissionsEditor />
              </TabsContent>
              <TabsContent value="estimates" className="mt-6">
                <EstimatesList />
              </TabsContent>
              <TabsContent value="orders" className="mt-6">
                <OrdersList />
              </TabsContent>
              <TabsContent value="price" className="mt-6">
                <PriceEditor />
              </TabsContent>
              <TabsContent value="panel" className="mt-6">
                <PanelDesigner />
              </TabsContent>
              <TabsContent value="schematic" className="mt-6">
                <SchematicEditor />
              </TabsContent>
              <TabsContent value="shapes" className="mt-6">
                <ShapeLibrary />
              </TabsContent>

              <TabsContent value="ugo-library" className="mt-6">
                <SchematicSymbolLibrary />
              </TabsContent>

              <TabsContent value="device-catalog" className="mt-6">
                <DeviceCatalog />
              </TabsContent>


              <TabsContent value="assembly-test" className="mt-6">
                <PanelAssemblyTest />
              </TabsContent>

              <TabsContent value="spec-test" className="mt-6">
                <SpecAssemblyTest />
              </TabsContent>

              <TabsContent value="group-test" className="mt-6">
                <GroupAssemblyTest />
              </TabsContent>


              <TabsContent value="texts" className="mt-6">
                <TextsEditor />
              </TabsContent>
              <TabsContent value="services" className="mt-6">
                <ServicesEditor />
              </TabsContent>
              <TabsContent value="works" className="mt-6">
                <ProjectsEditor />
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <ReviewsEditor />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
