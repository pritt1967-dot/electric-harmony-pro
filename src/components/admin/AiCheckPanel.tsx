import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { aiCheckPanel } from "@/lib/ai-check.functions";
import type { AiCheckItem, AiCheckResult, PanelSnapshot, SuggestedChange } from "@/lib/ai-check/types";

type State =
  | { s: "ready" }
  | { s: "checking" }
  | { s: "result"; result: AiCheckResult; cached: boolean }
  | { s: "unavailable" | "error" | "rate_limited"; message: string };

const SECTIONS: { key: keyof AiCheckResult; title: string }[] = [
  { key: "errors", title: "🔴 Ошибки" },
  { key: "warnings", title: "🟡 Предупреждения" },
  { key: "recommendations", title: "🔵 Рекомендации" },
  { key: "explanations", title: "ℹ️ Пояснения" },
];

export function AiCheckPanel({
  getSnapshot,
  onApply,
}: {
  getSnapshot: () => PanelSnapshot;
  onApply: (change: SuggestedChange) => void;
}) {
  const run = useServerFn(aiCheckPanel);
  const [state, setState] = useState<State>({ s: "ready" });

  async function check() {
    setState({ s: "checking" });
    try {
      const r = await run({ data: getSnapshot() });
      if (r.ok) setState({ s: "result", result: r.result, cached: r.cached });
      else setState({ s: r.code === "rate_limited" ? "rate_limited" : r.code === "unavailable" ? "unavailable" : "error", message: r.message });
    } catch {
      setState({ s: "unavailable", message: "ИИ-проверка временно недоступна" });
    }
  }

  function apply(it: AiCheckItem) {
    const ch = it.suggested_change;
    if (!ch || ch.action !== "set_label" || !ch.key || !ch.value) return;
    if (window.confirm(`Применить изменение маркировки на «${ch.value}»?`)) onApply(ch);
  }

  return (
    <div className="rounded-xl border bg-card p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">Проверка щита ИИ</div>
        <Button size="sm" variant="outline" onClick={check} disabled={state.s === "checking"}>
          {state.s === "checking" ? "Проверка…" : "Проверить ИИ"}
        </Button>
      </div>
      {state.s !== "result" && state.s !== "ready" && state.s !== "checking" && (
        <p className="mt-2 text-xs text-destructive">{state.message}</p>
      )}
      {state.s === "result" && (
        <div className="mt-2 space-y-2 text-xs">
          {state.cached && <div className="text-muted-foreground">Результат из кэша (щит не изменялся).</div>}
          {SECTIONS.map(({ key, title }) =>
            state.result[key].length ? (
              <div key={key}>
                <div className="font-medium">{title}</div>
                <ul className="mt-1 space-y-1">
                  {state.result[key].map((it) => (
                    <li key={it.id} className="flex items-start gap-2">
                      <span className="flex-1">
                        {it.text}
                        {it.related_marks?.length ? (
                          <span className="text-muted-foreground"> ({it.related_marks.join(", ")})</span>
                        ) : null}
                      </span>
                      {it.suggested_change?.action === "set_label" && it.suggested_change.key && (
                        <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => apply(it)}>
                          Применить
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
