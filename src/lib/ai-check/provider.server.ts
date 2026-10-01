import type { AiCheckProvider } from "./types";
import { createGigaChatCheckProvider } from "./providers/gigachat-check.server";

/**
 * Провайдер ИИ-проверки — GigaChat (только сервер, ключ GIGACHAT_AUTH_KEY).
 * OpenAI и Lovable AI не используются. null — ключ не задан, ИИ недоступен.
 */
export function getAiCheckProvider(): AiCheckProvider | null {
  if (!process.env["GIGACHAT_AUTH_KEY"]?.trim()) return null;
  return createGigaChatCheckProvider();
}
