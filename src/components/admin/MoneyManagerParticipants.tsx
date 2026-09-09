import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRightLeft, CalendarDays, ChevronDown, Loader2, Plus, Search, Trash2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createFinanceOperation, createFinanceParticipant, deleteFinanceOperation, loadFinanceData } from "@/lib/finance.functions";

const PROJECT_ID = "c6287ea3-0e53-4fea-a51c-3b4eef980963";
const money = (v: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v))} ₽`;
const todayMoscow = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const formatDate = (v: string) => new Date(`${v}T00:00:00`).toLocaleDateString("ru-RU");

type Participant = { id: string; name: string };
type Category = { id: string; name: string; affects_project_balance: boolean };
type Operation = {
  id: string;
  operation_date: string;
  operation_type: "income" | "expense" | "transfer";
  from_name: string | null;
  to_name: string | null;
  from_participant_id?: string | null;
  to_participant_id?: string | null;
  amount: number;
  category_id: string | null;
  comment: string | null;
  category?: Category | null;
};

function ParticipantPicker({ label, value, participants, onChange, excludeId }: { label: string; value: string; participants: Participant[]; onChange: (p: Participant) => void; excludeId?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = participants.find(p => p.id === value);
  const filtered = participants.filter(p => p.id !== excludeId && p.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="mt-1.5 w-full justify-between font-normal">
            <span className={selected ? "text-foreground" : "text-muted-foreground"}>{selected?.name ?? "Выберите участника"}</span>
            <ChevronDown className="size-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(360px,calc(100vw-32px))] p-2" align="start">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск участника…" className="pl-9" />
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? <div className="p-3 text-sm text-muted-foreground">Участник не найден</div> : filtered.map(p => (
              <button key={p.id} type="button" className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted" onClick={() => { onChange(p); setOpen(false); setQuery(""); }}>
                <Users className="mr-2 size-4 text-muted-foreground" />{p.name}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function MoneyManagerParticipants() {
  const qc = useQueryClient();
  const formRef = useRef<HTMLDivElement | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [form, setForm] = useState({ operation_date: todayMoscow(), fromId: "", toId: "", amount: "", comment: "" });
  const fetchFinance = useServerFn(loadFinanceData);
  const addOperationFn = useServerFn(createFinanceOperation);
  const removeOperationFn = useServerFn(deleteFinanceOperation);
  const addParticipantFn = useServerFn(createFinanceParticipant);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["money-manager", PROJECT_ID],
    queryFn: async () => {
      const result = await fetchFinance({ data: { projectId: PROJECT_ID } });
      if (!result || result.error) throw new Error(result?.error || "Финансовый сервер не ответил");
      const categories = Array.isArray(result.categories) ? result.categories as Category[] : [];
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const operations = (Array.isArray(result.operations) ? result.operations as Operation[] : []).map(o => ({ ...o, category: o.category_id ? categoryMap.get(o.category_id) ?? null : null }));
      return { operations, participants: Array.isArray(result.participants) ? result.participants as Participant[] : [], categories };
    },
  });

  const participants = data?.participants ?? [];
  const operations = data?.operations ?? [];

  const balances = useMemo(() => participants.map(p => {
    const received = operations.filter(o => o.to_participant_id === p.id || (!o.to_participant_id && o.to_name === p.name)).reduce((s, o) => s + Number(o.amount), 0);
    const sent = operations.filter(o => o.from_participant_id === p.id || (!o.from_participant_id && o.from_name === p.name)).reduce((s, o) => s + Number(o.amount), 0);
    return { ...p, received, sent, balance: received - sent };
  }), [participants, operations]);

  const totalReceived = balances.reduce((s, p) => s + p.received, 0);
  const totalSent = balances.reduce((s, p) => s + p.sent, 0);
  const participantTransferTotal = operations.filter(o => o.operation_type === "transfer" && (o.from_participant_id || o.to_participant_id)).reduce((s, o) => s + Number(o.amount), 0);

  useEffect(() => { if (showTransfer) requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }, [showTransfer]);

  const addTransfer = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount.replace(/\s/g, "").replace(",", "."));
      if (!form.fromId || !form.toId) throw new Error("Выберите отправителя и получателя");
      if (form.fromId === form.toId) throw new Error("Нельзя перевести деньги самому себе");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Укажите сумму больше нуля");
      const from = participants.find(p => p.id === form.fromId);
      const to = participants.find(p => p.id === form.toId);
      if (!from || !to) throw new Error("Участник не найден");
      await addOperationFn({ data: { projectId: PROJECT_ID, operation_date: form.operation_date, operation_type: "transfer", from_name: from.name, to_name: to.name, from_participant_id: from.id, to_participant_id: to.id, amount, category_id: null, comment: form.comment || null } });
    },
    onSuccess: () => { toast.success("Перевод между участниками добавлен"); setForm({ operation_date: todayMoscow(), fromId: "", toId: "", amount: "", comment: "" }); setShowTransfer(false); qc.invalidateQueries({ queryKey: ["money-manager", PROJECT_ID] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addParticipant = useMutation({
    mutationFn: async () => { const name = newParticipant.trim(); if (!name) throw new Error("Введите имя участника"); if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) throw new Error("Такой участник уже есть"); await addParticipantFn({ data: { projectId: PROJECT_ID, name } }); },
    onSuccess: () => { setNewParticipant(""); toast.success("Участник добавлен"); qc.invalidateQueries({ queryKey: ["money-manager", PROJECT_ID] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteOperation = useMutation({
    mutationFn: async (id: string) => { await removeOperationFn({ data: { id } }); },
    onSuccess: () => { toast.success("Операция удалена"); qc.invalidateQueries({ queryKey: ["money-manager", PROJECT_ID] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex items-center gap-2 py-16 text-muted-foreground"><Loader2 className="size-5 animate-spin" /> Загрузка движения денег…</div>;
  if (isError) return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm"><div className="font-medium">Не удалось загрузить финансовые данные.</div><div className="mt-1 text-muted-foreground">{error instanceof Error ? error.message : "Проверьте подключение"}</div></div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><div className="flex items-center gap-2"><Wallet className="size-5" /><h2 className="text-lg font-bold">Движение денег между участниками</h2></div><p className="mt-1 text-sm text-muted-foreground">Участники выбираются из базы. Перевод не является расходом.</p></div>
          <Button onClick={() => setShowTransfer(v => !v)}><ArrowRightLeft className="mr-2 size-4" /> Перевод между участниками</Button>
        </div>
      </div>

      {showTransfer && <div ref={formRef} className="rounded-2xl border-2 border-brand/40 bg-card p-4 sm:p-5">
        <h3 className="font-bold">Новый перевод</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div><Label>Дата</Label><Popover><PopoverTrigger asChild><Button type="button" variant="outline" className="mt-1.5 w-full justify-start font-normal"><CalendarDays className="mr-2 size-4" />{new Date(`${form.operation_date}T12:00:00`).toLocaleDateString("ru-RU")}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={new Date(`${form.operation_date}T12:00:00`)} onSelect={d => d && setForm(f => ({ ...f, operation_date: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` }))} initialFocus /></PopoverContent></Popover></div>
          <ParticipantPicker label="От кого" value={form.fromId} participants={participants} onChange={p => setForm(f => ({ ...f, fromId: p.id, toId: f.toId === p.id ? "" : f.toId }))} />
          <ParticipantPicker label="Кому" value={form.toId} participants={participants} excludeId={form.fromId} onChange={p => setForm(f => ({ ...f, toId: p.id }))} />
          <div><Label>Сумма</Label><Input className="mt-1.5" inputMode="decimal" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div className="sm:col-span-2 lg:col-span-4"><Label>Комментарий</Label><Textarea className="mt-1.5" placeholder="Например: возврат аванса" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} /></div>
        </div>
        <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowTransfer(false)}>Отмена</Button><Button onClick={() => addTransfer.mutate()} disabled={addTransfer.isPending}>{addTransfer.isPending ? "Сохранение…" : "Сохранить перевод"}</Button></div>
      </div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4"><div className="text-sm text-muted-foreground">Получено участниками</div><div className="mt-1 text-2xl font-bold">{money(totalReceived)}</div></div>
        <div className="rounded-2xl border bg-card p-4"><div className="text-sm text-muted-foreground">Передано участниками</div><div className="mt-1 text-2xl font-bold">{money(totalSent)}</div></div>
        <div className="rounded-2xl border bg-card p-4"><div className="text-sm text-muted-foreground">Переводы участник → участник</div><div className="mt-1 text-2xl font-bold">{money(participantTransferTotal)}</div></div>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex items-center gap-2"><Users className="size-5" /><h3 className="font-bold">Баланс участников</h3></div>
        <div className="mt-4 grid gap-2">
          {balances.map(p => <div key={p.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <div className="font-medium">{p.name}</div><div className="text-sm text-muted-foreground">получил {money(p.received)}</div><div className="text-sm text-muted-foreground">передал {money(p.sent)}</div><div className={`font-bold ${p.balance > 0 ? "text-emerald-600" : p.balance < 0 ? "text-destructive" : ""}`}>{p.balance > 0 ? "+" : ""}{money(p.balance)}</div>
          </div>)}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h3 className="font-bold">Участники</h3>
        <div className="mt-3 flex gap-2"><Input placeholder="Имя нового участника" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} /><Button onClick={() => addParticipant.mutate()} disabled={addParticipant.isPending}><Plus className="mr-2 size-4" />Добавить</Button></div>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h3 className="font-bold">История движения</h3>
        <div className="mt-3 space-y-2">
          {operations.map(o => <div key={o.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-medium">{o.operation_type === "transfer" ? `${o.from_name ?? "—"} → ${o.to_name ?? "—"}` : `${o.from_name ?? "—"} → ${o.to_name ?? "—"}`}</div><div className="text-xs text-muted-foreground">{formatDate(o.operation_date)}{o.comment ? ` · ${o.comment}` : ""}</div></div>
            <div className="flex items-center gap-3"><span className="font-bold">{money(Number(o.amount))}</span><Button variant="ghost" size="icon" onClick={() => deleteOperation.mutate(o.id)} disabled={deleteOperation.isPending}><Trash2 className="size-4" /></Button></div>
          </div>)}
          {operations.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">Операций пока нет</div>}
        </div>
      </div>
    </div>
  );
}
