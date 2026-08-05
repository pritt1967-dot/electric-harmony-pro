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
    <div className="min-h-screen bg-secondary/30">
      <Toaster richColors position="top-center" />
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg gradient-brand text-brand-foreground">
              <Zap className="size-4" />
            </span>
            <span className="font-extrabold tracking-tight">
              S&M electric{" "}
              <span className="font-medium text-muted-foreground">/ Админка</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ExternalLink className="mr-2 size-4" /> Сайт
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-2 size-4" /> Выйти
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
              <TabsList className="flex-wrap">
                <TabsTrigger value="submissions">Заявки</TabsTrigger>
                <TabsTrigger value="texts">Тексты</TabsTrigger>
                <TabsTrigger value="services">Услуги</TabsTrigger>
                <TabsTrigger value="works">Работы</TabsTrigger>
                <TabsTrigger value="reviews">Отзывы</TabsTrigger>
              </TabsList>
              <TabsContent value="submissions" className="mt-6">
                <SubmissionsEditor />
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
