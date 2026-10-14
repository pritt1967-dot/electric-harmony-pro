import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, ShieldAlert, ShieldQuestion } from "lucide-react";

import { verifyFinanceDocument } from "@/lib/finance-documents.functions";

type Result = { status: string; docType?: string; issuedAt?: string; checkCode?: string };

export const Route = createFileRoute("/verify/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ s: typeof s.s === "string" ? s.s : "" }),
  head: () => ({
    meta: [
      { title: "Проверка документа — S&M Electric" },
      { name: "description", content: "Проверка подлинности финансового документа S&M Electric." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Проверка документа — S&M Electric" },
      { property: "og:description", content: "Проверка подлинности финансового документа S&M Electric." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyPage,
});

const TEXT: Record<string, { title: string; note: string; tone: "ok" | "bad" | "warn" }> = {
  valid: { title: "Документ действителен", note: "Содержимое совпадает с данными на момент формирования.", tone: "ok" },
  modified: { title: "Документ изменён", note: "Данные документа не совпадают с подписанным состоянием. Не принимайте его как подлинный.", tone: "bad" },
  invalid: { title: "Подпись недействительна", note: "Запись документа повреждена или подделана.", tone: "bad" },
  not_found: { title: "Документ не найден", note: "Ссылка неверна, повреждена или документ не выдавался.", tone: "bad" },
  rate_limited: { title: "Слишком много проверок", note: "Повторите попытку через несколько минут.", tone: "warn" },
  unavailable: { title: "Проверка временно недоступна", note: "Повторите попытку позже.", tone: "warn" },
};

function VerifyPage() {
  const { id } = Route.useParams();
  const { s } = Route.useSearch();
  const verify = useServerFn(verifyFinanceDocument);
  const [res, setRes] = useState<Result | null>(null);

  useEffect(() => {
    verify({ data: { id, s } }).then(setRes).catch(() => setRes({ status: "unavailable" }));
  }, [id, s, verify]);

  const t = res ? TEXT[res.status] ?? TEXT.unavailable : null;
  const Icon = !t ? Loader2 : t.tone === "ok" ? CheckCircle2 : t.tone === "bad" ? ShieldAlert : ShieldQuestion;
  const color = !t ? "text-muted-foreground" : t.tone === "ok" ? "text-primary" : t.tone === "bad" ? "text-destructive" : "text-muted-foreground";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">S&amp;M Electric · проверка документа</p>
        <div className="mt-4 flex items-start gap-3">
          <Icon className={`mt-0.5 size-7 shrink-0 ${color} ${!t ? "animate-spin" : ""}`} />
          <div>
            <h1 className="text-xl font-semibold">{t ? t.title : "Проверяем…"}</h1>
            {t && <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>}
          </div>
        </div>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Номер</dt><dd className="break-all text-right font-mono">{id}</dd></div>
          {res?.docType && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Тип</dt><dd className="text-right">{res.docType}</dd></div>}
          {res?.issuedAt && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Сформирован</dt><dd className="text-right">{new Date(res.issuedAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК</dd></div>}
          {res?.checkCode && <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Контрольный код</dt><dd className="text-right font-mono">{res.checkCode}</dd></div>}
        </dl>
        {res?.checkCode && <p className="mt-4 text-xs text-muted-foreground">Сверьте номер и контрольный код с напечатанными на документе.</p>}
      </div>
    </main>
  );
}
