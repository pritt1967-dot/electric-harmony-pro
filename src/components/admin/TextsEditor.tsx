import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "hero_title", label: "Главный экран — заголовок", multiline: true },
  { key: "hero_subtitle", label: "Главный экран — описание", multiline: true },
  { key: "services_title", label: "Услуги — заголовок" },
  { key: "services_subtitle", label: "Услуги — описание", multiline: true },
  { key: "works_title", label: "Работы — заголовок" },
  { key: "works_subtitle", label: "Работы — описание", multiline: true },
  { key: "reviews_title", label: "Отзывы — заголовок" },
  { key: "about_title", label: "О компании — заголовок", multiline: true },
  { key: "about_text", label: "О компании — текст", multiline: true },
];

export function TextsEditor() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, value")
      .then(({ data }) => {
        const map: Record<string, string> = {};
        for (const row of data ?? []) map[row.key] = row.value;
        setValues(map);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const rows = FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) toast.error("Ошибка сохранения: " + error.message);
    else toast.success("Тексты сохранены");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {FIELDS.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <Label htmlFor={f.key}>{f.label}</Label>
          {f.multiline ? (
            <Textarea
              id={f.key}
              rows={3}
              value={values[f.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
            />
          ) : (
            <Input
              id={f.key}
              value={values[f.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [f.key]: e.target.value }))
              }
            />
          )}
        </div>
      ))}
      <Button onClick={save} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Save className="mr-2 size-4" />
        )}
        Сохранить тексты
      </Button>
    </div>
  );
}
