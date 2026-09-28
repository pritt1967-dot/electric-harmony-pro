import type { AiCheckProvider } from "./types";
import { createOpenAiProvider } from "./providers/openai.server";

/**
 * Выбор провайдера по AI_CHECK_PROVIDER (по умолчанию и в production — openai).
 * Автоматического перехода на Lovable AI нет. null — ИИ недоступен.
 */
export function getAiCheckProvider(): AiCheckProvider | null {
  const name = (process.env["AI_CHECK_PROVIDER"] || "openai").trim().toLowerCase();
  if (name !== "openai") return null;
  const key = process.env["OPENAI_API_KEY"]?.trim();
  if (!key) return null;
  return createOpenAiProvider(key, process.env["AI_CHECK_MODEL"]?.trim());
}
