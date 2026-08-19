import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { LOGO_URL } from "@/lib/logo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthDetails = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: OAuthDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id:
      typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get(
      "authorization_id",
    )!;
    const { data, error } = await oauthApi().getAuthorizationDetails(
      authorizationId,
    );
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">
        Не удалось загрузить запрос на доступ:{" "}
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "приложение";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Сервер авторизации не вернул адрес перенаправления.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-brand">
        <div className="flex items-center justify-center gap-2">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-foreground">
            <img
              src={LOGO_URL}
              alt="S&M Electric — логотип"
              width={40}
              height={40}
              className="size-10 object-contain"
            />
          </span>
          <span className="text-lg font-extrabold tracking-tight">
            S&M electric
          </span>
        </div>
        <h1 className="mt-6 text-center text-2xl font-extrabold">
          Разрешить доступ «{clientName}»?
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {clientName} сможет работать с данными сайта от вашего имени: читать
          контент и заявки, изменять тексты и статусы заявок.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Button
            className="flex-1"
            disabled={busy}
            onClick={() => decide(true)}
          >
            Разрешить
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Отклонить
          </Button>
        </div>
      </div>
    </main>
  );
}
