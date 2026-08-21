import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SURCHARGE_KEYS, SURCHARGE_META, type SurchargeKey } from "@/lib/estimates";
import { fetchSurchargePercents } from "@/lib/surcharge-settings";

export function SurchargeSettings() {
  const [values, setValues] = useState<Record<SurchargeKey, number> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSurchargePercents().then(setValues);
  }, []);

  async function save() {
    if (!values) return;
    setSaving(true);
    const rows = SURCHARGE_KEYS.map((k) => ({
      key: SURCHARGE_META[k].settingKey,
      value: String(values[k] ?? SURCHARGE_META[k].defaultPercent),
    }));
    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("Ошибка сохранения: " + error.message);
    else toast.success("Проценты сохранены — применятся к новым сметам");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="font-bold">Дополнительные расходы — проценты по умолчанию</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Применяются к новым сметам. Уже созданные сметы сохраняют свои значения.
      </p>
      {!values ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-brand" />
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {SURCHARGE_KEYS.map((k) => (
              <div key={k} className="space-y-1.5">
                <Label className="text-xs">{SURCHARGE_META[k].label}, %</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  value={values[k]}
                  onChange={(e) =>
                    setValues((v) =>
                      v ? { ...v, [k]: Number(e.target.value) } : v,
                    )
                  }
                />
              </div>
            ))}
          </div>
          <Button className="mt-4" size="sm" onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Сохранить проценты
          </Button>
        </>
      )}
    </div>
  );
}
