import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, ExternalLink, Loader2, ShieldAlert } from "lucide-react";
import { Toaster } from "sonner";

import logoAsset from "@/assets/logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { claimAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextsEditor } from "@/components/admin/TextsEditor";
import { ServicesEditor } from "@/components/admin/ServicesEditor";
import { WorksEditor } from "@/components/admin/WorksEditor";
import { ReviewsEditor } from "@/components/admin/ReviewsEditor";
import { SubmissionsEditor } from "@/components/admin/SubmissionsEditor";
import { PriceEditor } from "@/components/admin/PriceEditor";
import { EstimatesList } from "@/components/admin/EstimatesList";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const claim = useServerFn(claimAdmin);
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
                src={logoAsset.url}
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

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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
            <h1 className="text-2xl font-extrabold tracking-tight">
              Управление контентом
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Изменения появляются на сайте сразу после сохранения.
            </p>

            <Tabs defaultValue="submissions" className="mt-6">
              <TabsList className="flex h-auto w-full flex-nowrap items-center justify-start gap-1 overflow-x-auto p-1 scrollbar-hide sm:inline-flex sm:h-9 sm:flex-wrap sm:justify-center">
                <TabsTrigger value="submissions" className="shrink-0">Заявки</TabsTrigger>
                <TabsTrigger value="estimates" className="shrink-0">Сметы</TabsTrigger>
                <TabsTrigger value="price" className="shrink-0">Прайс</TabsTrigger>
                <TabsTrigger value="texts" className="shrink-0">Тексты</TabsTrigger>
                <TabsTrigger value="services" className="shrink-0">Услуги</TabsTrigger>
                <TabsTrigger value="works" className="shrink-0">Работы</TabsTrigger>
                <TabsTrigger value="reviews" className="shrink-0">Отзывы</TabsTrigger>
              </TabsList>
              <TabsContent value="submissions" className="mt-6">
                <SubmissionsEditor />
              </TabsContent>
              <TabsContent value="estimates" className="mt-6">
                <EstimatesList />
              </TabsContent>
              <TabsContent value="price" className="mt-6">
                <PriceEditor />
              </TabsContent>
              <TabsContent value="texts" className="mt-6">
                <TextsEditor />
              </TabsContent>
              <TabsContent value="services" className="mt-6">
                <ServicesEditor />
              </TabsContent>
              <TabsContent value="works" className="mt-6">
                <WorksEditor />
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
