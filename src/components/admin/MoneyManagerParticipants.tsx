import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, CalendarDays, ChevronDown, FileText, FolderPlus, Loader2, PieChart as PieChartIcon, Plus, Search, Trash2, TrendingUp, UserPlus, Users, Wallet } from "lucide-react";
import { CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  attachParticipantClient,
  createFinanceOperationClient,
  createFinanceParticipantClient,
  createFinanceProjectClient,
  deleteFinanceOperationClient,
  detachParticipantClient,
  listAllParticipantsClient,
  listFinanceProjectsClient,
  loadFinanceDataClient,
  type FinanceProjectRow,
} from "@/lib/finance-client";

const MAIN_PROJECT_ID = "c6287ea3-0e53-4fea-a51c-3b4eef980963";
const money = (v: number) => `${new Intl.NumberFormat("ru-RU").format(Math.round(v))} ₽`;
const todayMoscow = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const formatDate = (v: string) => new Date(`${v}T00:00:00`).toLocaleDateString("ru-RU");

const PIE_COLORS = ["#1d4ed8", "#0ea5e9", "#f59e0b", "#16a34a", "#a855f7", "#dc2626", "#64748b"];

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
  const [projectId, setProjectId] = useState(MAIN_PROJECT_ID);
  const [showTransfer, setShowTransfer] = useState(false);
  const [form, setForm] = useState({ operation_date: todayMoscow(), fromId: "", toId: "", amount: "", comment: "" });
  const [pdfBusy, setPdfBusy] = useState(false);

  const [projectDialog, setProjectDialog] = useState(false);
  const [projectForm, setProjectForm] = useState({ projectName: "", customerName: "", objectName: "" });
  const [participantDialog, setParticipantDialog] = useState(false);
  const [existingId, setExistingId] = useState("");
  const [newParticipant, setNewParticipant] = useState("");
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string; operations: number } | null>(null);

  const projectsQuery = useQuery({ queryKey: ["finance-projects"], queryFn: listFinanceProjectsClient });
  const allParticipantsQuery = useQuery({ queryKey: ["finance-all-participants"], queryFn: listAllParticipantsClient, enabled: participantDialog });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["money-manager", projectId],
    queryFn: async () => {
      const result = await loadFinanceDataClient(projectId);
      if (!result || result.error) throw new Error(result?.error || "Финансовый сервер не ответил");
      const categories = Array.isArray(result.categories) ? result.categories as Category[] : [];
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const operations = (Array.isArray(result.operations) ? result.operations as Operation[] : []).map(o => ({ ...o, category: o.category_id ? categoryMap.get(o.category_id) ?? null : null }));
      return {
        operations,
        participants: Array.isArray(result.participants) ? result.participants as Participant[] : [],
        categories,
        project: result.project ?? { customer_name: "", project_name: "Проект", status: "active" },
      };
    },
  });

  const projects: FinanceProjectRow[] = projectsQuery.data ?? [];
  const participants = data?.participants ?? [];
  const operations = data?.operations ?? [];
  const project = data?.project ?? { customer_name: "", project_name: "Проект", status: "active" };
  const refresh = () => { qc.invalidateQueries({ queryKey: ["money-manager", projectId] }); qc.invalidateQueries({ queryKey: ["finance-all-participants"] }); };

  const stats = useMemo(() => {
    const income = operations.filter(o => o.operation_type === "income").reduce((s, o) => s + Number(o.amount), 0);
    const projectExpenses = operations.filter(o => o.operation_type === "expense" && o.category?.affects_project_balance !== false);
    const expenses = projectExpenses.reduce((s, o) => s + Number(o.amount), 0);
    const transfers = operations.filter(o => o.operation_type === "transfer");

    const byCategoryMap = new Map<string, number>();
    for (const o of projectExpenses) {
      const key = o.category?.name || "Без статьи";
      byCategoryMap.set(key, (byCategoryMap.get(key) ?? 0) + Number(o.amount));
    }
    const byCategory = [...byCategoryMap.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);

    const byDate = new Map<string, { income: number; expense: number }>();
    for (const o of operations) {
      const row = byDate.get(o.operation_date) ?? { income: 0, expense: 0 };
      if (o.operation_type === "income") row.income += Number(o.amount);
      else if (o.operation_type === "expense" && o.category?.affects_project_balance !== false) row.expense += Number(o.amount);
      byDate.set(o.operation_date, row);
    }
    let ci = 0; let ce = 0;
    const timeline = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, v]) => { ci += v.income; ce += v.expense; return { date: formatDate(d), Поступления: ci, Расходы: ce, Остаток: ci - ce }; });

    const balances = participants.map(p => {
      const received = operations.filter(o => o.to_participant_id === p.id || (!o.to_participant_id && o.to_name === p.name)).reduce((s, o) => s + Number(o.amount), 0);
      const sent = operations.filter(o => o.from_participant_id === p.id || (!o.from_participant_id && o.from_name === p.name)).reduce((s, o) => s + Number(o.amount), 0);
      return { ...p, received, sent, balance: received - sent };
    });
    const balanceSum = balances.reduce((s, b) => s + b.balance, 0);

    return { income, expenses, remaining: income - expenses, byCategory, timeline, balances, balanceSum, transfers };
  }, [operations, participants]);

  useEffect(() => { if (showTransfer) requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })); }, [showTransfer]);
  useEffect(() => { setShowTransfer(false); setForm({ operation_date: todayMoscow(), fromId: "", toId: "", amount: "", comment: "" }); }, [projectId]);

  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      const { buildFinancePdf } = await import("@/lib/finance-pdf");
      const doc = await buildFinancePdf({
        customer: project.customer_name || "—",
        projectName: project.project_name || "Проект",
        income: stats.income,
        expenses: stats.expenses,
        remaining: stats.remaining,
        byCategory: stats.byCategory,
        balances: stats.balances.map(b => ({ name: b.name, received: b.received, spent: b.sent, balance: b.balance })),
        transfers: stats.transfers.map(o => ({ operation_date: o.operation_date, from_name: o.from_name, to_name: o.to_name, amount: Number(o.amount), comment: o.comment })),
        operations: operations.map(o => ({
          operation_date: o.operation_date,
          operation_type: o.operation_type,
          from_name: o.from_name,
          to_name: o.to_name,
          amount: Number(o.amount),
          categoryName: o.category?.name || "Без статьи",
          comment: o.comment,
        })),
      });
      doc.save("finance-report.pdf");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Не удалось сформировать PDF"); }
    finally { setPdfBusy(false); }
  };

  const createProject = useMutation({
    mutationFn: async () => {
      const object = projectForm.objectName.trim();
      const name = projectForm.projectName.trim() + (object ? ` — ${object}` : "");
      return createFinanceProjectClient({ projectName: name, customerName: projectForm.customerName });
    },
    onSuccess: (created) => {
      toast.success("Проект создан");
      setProjectDialog(false);
      setProjectForm({ projectName: "", customerName: "", objectName: "" });
      qc.invalidateQueries({ queryKey: ["finance-projects"] });
      setProjectId(created.id);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addExistingParticipant = useMutation({
    mutationFn: async () => { if (!existingId) throw new Error("Выберите участника"); await attachParticipantClient(projectId, existingId); },
    onSuccess: () => { toast.success("Участник добавлен в проект"); setExistingId(""); setParticipantDialog(false); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addNewParticipant = useMutation({
    mutationFn: async () => { const name = newParticipant.trim(); if (!name) throw new Error("Введите имя участника"); await createFinanceParticipantClient(projectId, name); },
    onSuccess: () => { toast.success("Новый участник создан и добавлен"); setNewParticipant(""); setParticipantDialog(false); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeParticipant = useMutation({
    mutationFn: async (id: string) => { await detachParticipantClient(projectId, id); },
    onSuccess: () => { toast.success("Участник исключён из проекта"); setRemoveTarget(null); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addTransfer = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount.replace(/\s/g, "").replace(",", "."));
      if (!form.fromId || !form.toId) throw new Error("Выберите отправителя и получателя");
      if (form.fromId === form.toId) throw new Error("Нельзя перевести деньги самому себе");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Укажите сумму больше нуля");
      const from = participants.find(p => p.id === form.fromId);
      const to = participants.find(p => p.id === form.toId);
      if (!from || !to) throw new Error("Участник не найден");
      await createFinanceOperationClient({ projectId, operation_date: form.operation_date, operation_type: "transfer", from_name: from.name, to_name: to.name, from_participant_id: from.id, to_participant_id: to.id, amount, category_id: null, comment: form.comment || null });
    },
    onSuccess: () => { toast.success("Перевод между участниками добавлен"); setForm({ operation_date: todayMoscow(), fromId: "", toId: "", amount: "", comment: "" }); setShowTransfer(false); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteOperation = useMutation({
    mutationFn: async (id: string) => { await deleteFinanceOperationClient(id); },
    onSuccess: () => { toast.success("Операция удалена"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const projectSwitcher = (
    <div className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="size-5" />
          <h2 className="text-lg font-bold">Деньги</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Проект:</span>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="min-w-52"><SelectValue placeholder="Выберите проект" /></SelectTrigger>
              <SelectContent>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.project_name || "Без названия"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => setProjectDialog(true)}><FolderPlus className="mr-2 size-4" /> Новый проект</Button>
        </div>
      </div>
    </div>
  );

  const projectDialogNode = (
    <Dialog open={projectDialog} onOpenChange={setProjectDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый проект</DialogTitle>
          <DialogDescription>Создаётся отдельный финансовый проект. Существующие проекты и их операции не меняются.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div><Label>Название проекта *</Label><Input className="mt-1.5" maxLength={120} value={projectForm.projectName} onChange={e => setProjectForm(f => ({ ...f, projectName: e.target.value }))} /></div>
          <div><Label>Заказчик</Label><Input className="mt-1.5" maxLength={160} value={projectForm.customerName} onChange={e => setProjectForm(f => ({ ...f, customerName: e.target.value }))} /></div>
          <div>
            <Label>Объект / адрес</Label>
            <Input className="mt-1.5" maxLength={200} value={projectForm.objectName} onChange={e => setProjectForm(f => ({ ...f, objectName: e.target.value }))} placeholder="Добавится к названию проекта" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setProjectDialog(false)}>Отмена</Button>
          <Button
            onClick={() => createProject.mutate()}
            disabled={createProject.isPending || !projectForm.projectName.trim()}
          >{createProject.isPending ? "Создание…" : "Создать проект"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) return <div className="space-y-5">{projectSwitcher}{projectDialogNode}<div className="flex items-center gap-2 py-16 text-muted-foreground"><Loader2 className="size-5 animate-spin" /> Загрузка движения денег…</div></div>;
  if (isError) return <div className="space-y-5">{projectSwitcher}{projectDialogNode}<div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm"><div className="font-medium">Не удалось загрузить финансовые данные.</div><div className="mt-1 text-muted-foreground">{error instanceof Error ? error.message : "Проверьте подключение"}</div></div></div>;

  const freeParticipants = (allParticipantsQuery.data ?? []).filter(p => !participants.some(x => x.id === p.id));

  return (
    <div className="space-y-5">
      {projectSwitcher}
      {projectDialogNode}

      {/* Финансовый отчёт */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="size-5" />
              <h2 className="text-lg font-bold">Финансовый отчёт</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{project.customer_name || "Заказчик не указан"} · {project.project_name}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={downloadPdf} disabled={pdfBusy}>
              <FileText className="mr-2 size-4" /> {pdfBusy ? "Формирую…" : "Скачать PDF"}
            </Button>
            <Button onClick={() => setShowTransfer(v => !v)}>
              <ArrowRightLeft className="mr-2 size-4" /> Перевод между участниками
            </Button>
          </div>
        </div>
      </div>

      {/* Показатели */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat title="Получено от заказчика" value={stats.income} icon={<ArrowDownLeft className="size-4" />} />
        <Stat title="Расходы проекта" value={stats.expenses} icon={<ArrowUpRight className="size-4" />} />
        <Stat title="Остаток проекта" value={stats.remaining} icon={<Wallet className="size-4" />} accent />
      </div>

      {/* Графики */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><PieChartIcon className="size-4 text-muted-foreground" /><h3 className="font-bold">Расходы по категориям</h3></div>
          {stats.byCategory.length ? <>
            <div className="mt-3 h-56 w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={stats.byCategory} dataKey="amount" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>{stats.byCategory.map((c, i) => <Cell key={c.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip formatter={(v: number) => money(Number(v))} /></PieChart></ResponsiveContainer></div>
            <ul className="mt-3 space-y-1.5 text-sm">{stats.byCategory.map((c, i) => <li key={c.name} className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2"><span className="size-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="truncate">{c.name}</span></span><span className="font-semibold whitespace-nowrap">{money(c.amount)}</span></li>)}<li className="flex items-center justify-between gap-3 border-t pt-1.5"><span className="text-muted-foreground">Всего расходов</span><span className="font-bold whitespace-nowrap">{money(stats.expenses)}</span></li></ul>
          </> : <p className="mt-3 text-sm text-muted-foreground">Расходов пока нет.</p>}
        </div>
        <div className="min-w-0 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex items-center gap-2"><TrendingUp className="size-4 text-muted-foreground" /><h3 className="font-bold">Динамика</h3></div>
          {stats.timeline.length ? <div className="mt-3 h-56 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={stats.timeline} margin={{ left: 4, right: 8, top: 8, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" opacity={0.25} /><XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={16} /><YAxis tick={{ fontSize: 11 }} width={54} tickFormatter={(v: number) => `${Math.round(Number(v) / 1000)}т`} /><Tooltip formatter={(v: number) => money(Number(v))} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line type="monotone" dataKey="Поступления" stroke="#1d4ed8" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="Расходы" stroke="#dc2626" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="Остаток" stroke="#16a34a" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div> : <p className="mt-3 text-sm text-muted-foreground">Операций пока нет.</p>}
        </div>
      </div>

      {/* Контроль баланса */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h3 className="font-bold">Контроль баланса</h3>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Получено от заказчика</span><span className="font-semibold">{money(stats.income)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Расходы проекта</span><span className="font-semibold">{money(stats.expenses)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Остаток проекта</span><span className="font-semibold">{money(stats.remaining)}</span></div>
          <div className="flex justify-between gap-3"><span className="text-muted-foreground">Сумма балансов участников</span><span className="font-semibold">{money(stats.balanceSum)}</span></div>
        </div>
        {Math.abs(stats.balanceSum - stats.remaining) > 1 && <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">Внимание: сумма балансов участников ({money(stats.balanceSum)}) не совпадает с остатком проекта ({money(stats.remaining)}).</div>}
      </div>

      {/* Перевод между участниками */}
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

      {/* Участники проекта */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><Users className="size-5" /><h3 className="font-bold">Участники проекта</h3></div>
          <Button variant="outline" onClick={() => setParticipantDialog(true)}><UserPlus className="mr-2 size-4" /> Добавить участника</Button>
        </div>
        <div className="mt-4 grid gap-2">
          {stats.balances.map(p => <div key={p.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-muted-foreground">получил {money(p.received)} · передал {money(p.sent)}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${p.balance > 0 ? "text-emerald-600" : p.balance < 0 ? "text-destructive" : ""}`}>{p.balance > 0 ? "+" : ""}{money(p.balance)}</span>
              <Button variant="ghost" size="sm" onClick={() => setRemoveTarget({ id: p.id, name: p.name, operations: operations.filter(o => o.from_participant_id === p.id || o.to_participant_id === p.id || o.from_name === p.name || o.to_name === p.name).length })}>
                <Trash2 className="mr-1.5 size-4" /> Удалить
              </Button>
            </div>
          </div>)}
          {stats.balances.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">В проекте пока нет участников</div>}
        </div>
      </div>

      {/* История */}
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <h3 className="font-bold">История операций <span className="font-normal text-muted-foreground">({operations.length})</span></h3>
        <div className="mt-3 space-y-2">
          {operations.map(o => <div key={o.id} className="flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium">{o.from_name ?? "—"} → {o.to_name ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{formatDate(o.operation_date)}{o.operation_type === "transfer" ? " · внутренний перевод" : ""}{o.comment ? ` · ${o.comment}` : ""}{o.category ? ` · ${o.category.name}` : ""}</div>
            </div>
            <div className="flex items-center gap-3"><span className="font-bold">{money(Number(o.amount))}</span><Button variant="ghost" size="icon" onClick={() => deleteOperation.mutate(o.id)} disabled={deleteOperation.isPending}><Trash2 className="size-4" /></Button></div>
          </div>)}
          {operations.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">Операций пока нет</div>}
        </div>
      </div>

      {/* Добавление участника */}
      <Dialog open={participantDialog} onOpenChange={setParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить участника</DialogTitle>
            <DialogDescription>Участник будет добавлен только в проект «{project.project_name}».</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Существующий участник</Label>
              <div className="mt-1.5 flex gap-2">
                <Select value={existingId} onValueChange={setExistingId}>
                  <SelectTrigger><SelectValue placeholder={allParticipantsQuery.isLoading ? "Загрузка…" : "Выберите участника"} /></SelectTrigger>
                  <SelectContent>
                    {freeParticipants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => addExistingParticipant.mutate()} disabled={addExistingParticipant.isPending || !existingId}>Добавить</Button>
              </div>
              {!allParticipantsQuery.isLoading && freeParticipants.length === 0 && <p className="mt-1.5 text-xs text-muted-foreground">Все участники базы уже в проекте.</p>}
            </div>
            <div>
              <Label>Новый участник</Label>
              <div className="mt-1.5 flex gap-2">
                <Input maxLength={80} placeholder="Имя участника" value={newParticipant} onChange={e => setNewParticipant(e.target.value)} />
                <Button variant="outline" onClick={() => addNewParticipant.mutate()} disabled={addNewParticipant.isPending || !newParticipant.trim()}><Plus className="mr-1.5 size-4" />Создать</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Удаление участника из проекта */}
      <Dialog open={Boolean(removeTarget)} onOpenChange={open => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить участника из проекта</DialogTitle>
            <DialogDescription>
              {removeTarget?.operations
                ? "У участника есть финансовая история в этом проекте. Участник будет исключён из проекта, но его операции и история сохранятся."
                : `Участник «${removeTarget?.name ?? ""}» будет исключён только из этого проекта.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => removeTarget && removeParticipant.mutate(removeTarget.id)} disabled={removeParticipant.isPending}>Удалить из проекта</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ title, value, icon, accent = false }: { title: string; value: number; icon: React.ReactNode; accent?: boolean }) {
  return <div className={`rounded-2xl border bg-card p-4 ${accent ? "ring-1 ring-brand/30" : ""}`}><div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{title}</div><div className="mt-2 text-2xl font-extrabold tracking-tight">{money(value)}</div></div>;
}
