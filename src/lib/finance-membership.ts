type Participant = { id: string; name: string };
type Operation = { from_participant_id?: string | null; to_participant_id?: string | null; from_name: string | null; to_name: string | null };

/** Membership controls selection; historical identities remain available for balances. */
export function projectParticipants(all: Participant[], links: { participant_id: string }[], operations: Operation[]) {
  const activeIds = new Set(links.map(link => link.participant_id));
  const historicalIds = new Set<string>();
  for (const op of operations) {
    for (const id of [op.from_participant_id, op.to_participant_id]) if (id) historicalIds.add(id);
    if (!op.from_participant_id && !op.to_participant_id) {
      for (const p of all) if (p.name === op.from_name || p.name === op.to_name) historicalIds.add(p.id);
    }
  }
  return {
    participants: all.filter(p => activeIds.has(p.id)),
    historicalParticipants: all.filter(p => historicalIds.has(p.id) && !activeIds.has(p.id)),
  };
}

type Rest = (path: string, init?: { method?: string }) => Promise<unknown>;
export async function removeProjectMembership(rest: Rest, projectId: string, participantId: string) {
  if (!projectId || !participantId) throw new Error("Выберите проект и участника");
  const filters = `project_id=eq.${encodeURIComponent(projectId)}&participant_id=eq.${encodeURIComponent(participantId)}`;
  await rest(`project_participants?${filters}`, { method: "DELETE" });
  const remaining = await rest(`project_participants?select=participant_id&${filters}`);
  if (!Array.isArray(remaining) || remaining.length > 0) {
    throw new Error("Участник остался в проекте. Проверьте права удаления связи участника с проектом.");
  }
}

export function membershipError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (/23503|foreign key|violates.*constraint/i.test(message)) return "Исключение заблокировано связанными записями. Операции, история и суммы не удалены.";
  if (/401|403|permission denied|Unauthorized|прав/i.test(message)) return "Нет доступа для исключения участника. Войдите заново или проверьте права финансового доступа.";
  if (/TIMEOUT|NETWORK_ERROR|fetch failed|недоступна/i.test(message)) return "Финансовая база не ответила. Обновите список перед повторной попыткой: связь могла быть уже удалена.";
  if (/остался в проекте|Выберите проект/.test(message)) return message;
  return "Не удалось исключить участника из проекта. Обновите список и повторите попытку. Финансовые операции не удаляются.";
}