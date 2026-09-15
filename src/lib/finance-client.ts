import {
  attachFinanceParticipant,
  createFinanceCategory,
  createFinanceOperation,
  createFinanceParticipant,
  createFinanceProject,
  deleteFinanceOperation,
  detachFinanceParticipant,
  listAllFinanceParticipants,
  listFinanceProjects,
  loadFinanceData,
} from "@/lib/finance.functions";
import type { FinanceCategory, FinanceOperationType, FinanceParticipant, FinancePayload, FinanceProjectRow } from "@/lib/finance.functions";

export type { FinanceProjectRow, FinanceOperationType };

/** Создаёт новую статью расходов (категорию) в финансовой базе. */
export async function createFinanceCategoryClient(name: string, affectsProjectBalance = true): Promise<FinanceCategory> {
  return createFinanceCategory({ data: { name, affectsProjectBalance } });
}

/**
 * Тонкая обёртка над серверными функциями финансового модуля.
 * Браузер никогда не обращается к финансовой базе напрямую.
 */

/** Все финансовые проекты для переключателя вверху раздела «Деньги». */
export async function listFinanceProjectsClient(): Promise<FinanceProjectRow[]> {
  return listFinanceProjects();
}

/** Создаёт новый финансовый проект в существующей таблице projects. */
export async function createFinanceProjectClient(input: { projectName: string; customerName: string }): Promise<FinanceProjectRow> {
  return createFinanceProject({ data: input });
}

/** Все участники базы — для добавления существующего участника в проект. */
export async function listAllParticipantsClient(): Promise<FinanceParticipant[]> {
  return listAllFinanceParticipants();
}

/** Привязывает существующего участника к выбранному проекту. */
export async function attachParticipantClient(projectId: string, participantId: string) {
  await attachFinanceParticipant({ data: { projectId, participantId } });
}

/** Убирает участника только из текущего проекта; сам участник и его операции сохраняются. */
export async function detachParticipantClient(projectId: string, participantId: string) {
  await detachFinanceParticipant({ data: { projectId, participantId } });
}

export async function loadFinanceDataClient(projectId: string): Promise<FinancePayload> {
  return loadFinanceData({ data: { projectId } });
}

export async function createFinanceOperationClient(data: { projectId: string; operation_date: string; operation_type: FinanceOperationType; from_name: string; to_name: string; from_participant_id?: string | null; to_participant_id?: string | null; amount: number; category_id: string | null; comment: string | null }) {
  return createFinanceOperation({ data });
}

export async function deleteFinanceOperationClient(id: string) {
  await deleteFinanceOperation({ data: { id } });
}

export async function createFinanceParticipantClient(projectId: string, rawName: string) {
  return createFinanceParticipant({ data: { projectId, name: rawName } });
}
