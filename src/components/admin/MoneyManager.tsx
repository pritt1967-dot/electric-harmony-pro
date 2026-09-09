import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Loader2, Plus, Trash2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createFinanceOperation,
  createFinanceParticipant,
  deleteFinanceOperation,
  loadFinanceData,
} from "@/lib/finance.functions";

const PROJECT_ID = "c6287ea3-0e53-4fea-a51c-3b4eef980963";
const CUSTOMER = "ООО «Си Проект»";

type Operation = {
  id: string;
  operation_date: string;
  operation_type: "income" | "expense" | "transfer";
  from_name: string | null;
  to_name: string | null;
  amount: number;
  category_id: string | null;
  comment: string | null;
  category?: { name: string; affects_project_balance: boolean } | null;
};
type Participant = { id: string; name: string };
type Category = { id: string; name: string; affects_project_balance: boolean };

const money = (v: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v))} ₽`;
const date = (v: string) => new Date(`${v}T00:00:00`).toLocaleDateString("ru-RU");

export function MoneyManager() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [form, setForm] = useState({
    operation_date: new Date().toISOString().slice(0, 10),
    operation_type: "expense" as Operation["operation_type"],
    from_name: "Макс",
    to_name: "Лемана Про",
    amount: "",
    category_id: "",
    comment: "",
  });

  const fetchFinance = useServerFn(loadFinanceData);
  const addOperationFn = useServerFn(createFinanceOperation);
  const removeOperationFn = useServerFn(deleteFinanceOperation);
  const addParticipantFn = useServerFn(createFinanceParticipant);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["money-manager", PROJECT_ID],
    queryFn: async () => {
      // Finance tables live in a separate backend, reached through server
      // functions so no finance credentials exist in the browser bundle.
      const result = await fetchFinance({ data: { projectId: PROJECT_ID } });

      const categoryMap = new Map<string, Category>(
        (result.categories ?? []).map((c: Category) => [c.id, c]),
      );
      const operations = (result.operations ?? []).map((o: Operation) => ({
        ...o,
        category: o.category_id ? categoryMap.get(o.category_id) ?? null : null,
      }));

      return {
        operations: operations as Operation[],
        participants: (result.participants ?? []) as Participant[],
        categories: (result.categories ?? []) as Category[],
        project: result.project ?? { customer_name: CUSTOMER, project_name: "Основной проект", status: "active" },
      };
    },
  });

  const operations = data?.operations ?? [];
  const participants = data?.participants ?? [];
  const categories = data?.categories ?? [];

  const stats = useMemo(() => {
    const income = operations.filter(o => o.operation_type === "income").reduce((s, o) => s + Number(o.amount), 0);
    const expenses = operations.filter(o => o.operation_type === "expense" && o.category?.affects_project_balance !== false).reduce((s, o) => s + Number(o.amount), 0);
    const balances = participants.map(p => {
      const received = operations.filter(o => o.to_name === p.name).reduce((s, o) => s + Number(o.amount), 0);
      const spent = operations.filter(o => o.from_name === p.name).reduce((s, o) => s + Number(o.amount), 0);
      return { ...p, received, spent, balance: received - spent };
    });
    return { income, expenses, remaining: income - expenses, balances };
  }, [operations, participants]);

  const addOperation = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount.replace(/\s/g, "").replace(",", "."));
      if (!amount || amount <= 0) throw new Error("Укажите сумму больше нуля");
      if (!form.from_name || !form.to_name) throw new Error("Укажите отправителя и получателя");
      await addOperationFn({ data: { projectId: PROJECT_ID, operation_date: form.operation_date, operation_type: form.operation_type, from_name: form.from_name, to_name: form.to_name, amount, category_id: form.category_id || null, comment: form.comment || null } });
    },
    onSuccess: () => {
      toast.success("Операция добавлена");
      setForm({ operation_date: new Date().toISOString().slice(0, 10), operation_type: "expense", from_name: "Макс", to_name: "Лемана Про", amount: "", category_id: "", comment: "" });
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["money-manager", PROJECT_ID] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteOperation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("operations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Операция удалена");
      qc.invalidateQueries({ queryKey: ["money-manager", PROJECT_ID] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addParticipant = useMutation({
    mutationFn: async () => {
      const name = newParticipant.trim();
      if (!name) throw new Error("Введите имя участника");
      const { data: p, error } = await db.from("participants").insert({ name }).select("id,name").single();
      if (error) throw error;
      const { error: linkError } = await db.from("project_participants").insert({ project_id: PROJECT_ID, participant_id: p.id });
      if (linkError) throw linkError;
    },
    onSuccess: () => {
      setNewParticipant("");
      toast.success("Участник добавлен");
      qc.invalidateQueries({ queryKey: ["money-manager", PROJECT_ID] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex items-center gap-2 py-16 text-muted-foreground"><Loader2 className="size-5 animate-spin" /> Загрузка движения денег…</div>;
  if (isError) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm"><div className="font-medium">Не удалось загрузить финансовые данные.</div><div className="mt-1 text-muted-foreground">{error instanceof Error ? error.message : "Проверьте подключение к Supabase."}</div></div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><Wallet className="size-5" /><h2 className="text-lg font-bold">Движение денег</h2></div>
            <p className="mt-1 text-sm text-muted-foreground">{CUSTOMER} · {data?.project?.project_name || "Основной проект"}</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)}><Plus className="mr-2 size-4" /> Новая операция</Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat title="Получено от заказчика" value={stats.income} icon={<ArrowDownLeft className="size-4" />} />
        <Stat title="Расходы проекта" value={stats.expenses} icon={<ArrowUpRight className="size-4" />} />
        <Stat title="Остаток проекта" value={stats.remaining} icon={<Wallet className="size-4" />} accent />
      </div>

      {showForm && (
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <h3 className="font-bold">Новая операция</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><Label>Дата</Label><Input className="mt-1.5" type="date" value={form.operation_date} onChange={e => setForm({ ...form, operation_date: e.target.value })} /></div>
            <div><Label>Тип</Label><Select value={form.operation_type} onValueChange={(v: Operation["operation_type"]) => setForm({ ...form, operation_type: v })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Приход</SelectItem><SelectItem value="expense">Расход</SelectItem><SelectItem value="transfer">Передача</SelectItem></SelectContent></Select></div>
            <div><Label>От кого</Label><Input className="mt-1.5" value={form.from_name} onChange={e => setForm({ ...form, from_name: e.target.value })} /></div>
            <div><Label>Кому</Label><Input className="mt-1.5" value={form.to_name} onChange={e => setForm({ ...form, to_name: e.target.value })} /></div>
            <div><Label>Сумма</Label><Input className="mt-1.5" inputMode="decimal" placeholder="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div><Label>Статья</Label><Select value={form.category_id} onValueChange={v => setForm({ ...form, category_id: v })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Выберите статью" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.affects_project_balance ? "" : " · не расход"}</SelectItem>)}</SelectContent></Select></div>
            <div className="sm:col-span-2"><Label>Комментарий</Label><Textarea className="mt-1.5 min-h-10" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} /></div>
          </div>
          <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button><Button onClick={() => addOperation.mutate()} disabled={addOperation.isPending}>{addOperation.isPending ? "Сохранение…" : "Сохранить"}</Button></div>
        </div>
      )}

      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Баланс участников</h3><Users className="size-4 text-muted-foreground" /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.balances.map(p => <div key={p.id} className="rounded-xl border p-3"><div className="font-semibold">{p.name}</div><div className={`mt-1 text-xl font-extrabold ${p.balance < 0 ? "text-destructive" : ""}`}>{money(p.balance)}</div><div className="mt-1 text-xs text-muted-foreground">получил {money(p.received)} · потратил {money(p.spent)}</div></div>)}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><Input placeholder="Новый участник" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} /><Button variant="outline" onClick={() => addParticipant.mutate()} disabled={addParticipant.isPending}><Plus className="mr-2 size-4" /> Добавить участника</Button></div>
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="border-b p-4"><h3 className="font-bold">Все операции <span className="font-normal text-muted-foreground">({operations.length})</span></h3></div>
        <div className="divide-y">
          {operations.map(o => <div key={o.id} className="grid gap-2 p-4 sm:grid-cols-[90px_1fr_auto_auto] sm:items-center">
            <div className="text-sm text-muted-foreground">{date(o.operation_date)}</div>
            <div className="min-w-0"><div className="flex items-center gap-2 font-medium">{o.operation_type === "transfer" ? <ArrowRightLeft className="size-4 shrink-0" /> : o.operation_type === "income" ? <ArrowDownLeft className="size-4 shrink-0" /> : <ArrowUpRight className="size-4 shrink-0" />}<span className="truncate">{o.from_name || "—"} → {o.to_name || "—"}</span></div><div className="text-xs text-muted-foreground">{o.category?.name || "Без статьи"}{o.comment ? ` · ${o.comment}` : ""}</div></div>
            <div className="font-bold whitespace-nowrap">{money(Number(o.amount))}</div>
            <Button variant="ghost" size="icon" aria-label="Удалить" onClick={() => { if (confirm("Удалить операцию?")) deleteOperation.mutate(o.id); }}><Trash2 className="size-4 text-muted-foreground" /></Button>
          </div>)}
          {!operations.length && <div className="p-8 text-center text-muted-foreground">Операций пока нет.</div>}
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, icon, accent = false }: { title: string; value: number; icon: React.ReactNode; accent?: boolean }) {
  return <div className={`rounded-2xl border bg-card p-4 ${accent ? "ring-1 ring-brand/30" : ""}`}><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{title}</div><div className="mt-2 text-2xl font-extrabold tracking-tight">{money(value)}</div></div>;
}
