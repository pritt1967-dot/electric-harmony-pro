/** Типы «Проверки щита ИИ» (клиентобезопасно, без секретов). */
import { z } from "zod";

const str = (max: number) => z.string().max(max);

export const PanelSnapshotSchema = z.object({
  network: z.object({
    phases: z.number().int().min(1).max(3),
    voltage: z.number().int().min(100).max(500),
    grounding: str(40),
    ip: str(20),
  }),
  rails: z.object({ count: z.number().int().min(0).max(20), modules: z.number().int().min(0).max(100), reserve: z.number().int().min(0).max(100) }),
  main: str(200).nullable(),
  devices: z
    .array(
      z.object({
        key: str(64),
        mark: str(80),
        role: str(20),
        manufacturer: str(80),
        series: str(80),
        model: str(120),
        rated_a: z.number().nullable(),
        curve: str(10).nullable(),
        poles: z.number().int().nullable(),
        modules: z.number().int().min(0).max(20),
        rail: z.number().int(),
        start: z.number().int(),
        end: z.number().int(),
        out_of_rail: z.boolean(),
        substitute: z.boolean(),
      }),
    )
    .max(120),
  chain: z
    .array(z.object({ rcd: str(200).nullable(), n_bus: str(40), lines: z.array(str(200)).max(60) }))
    .max(40),
  n_buses: z.array(str(40)).max(40),
  pe_bus: str(40),
  checks: z.array(z.object({ title: str(200), ok: z.boolean(), detail: str(400) })).max(60),
});
export type PanelSnapshot = z.infer<typeof PanelSnapshotSchema>;

export const SuggestedChangeSchema = z.object({
  action: z.enum(["set_label", "none"]),
  key: str(64).nullable(),
  value: str(80).nullable(),
});
export type SuggestedChange = z.infer<typeof SuggestedChangeSchema>;

export const AiCheckItemSchema = z.object({
  id: str(40),
  text: str(1000),
  related_marks: z.array(str(80)).max(30).optional(),
  suggested_change: SuggestedChangeSchema.nullable().optional(),
});
export type AiCheckItem = z.infer<typeof AiCheckItemSchema>;

export const AiCheckResultSchema = z.object({
  errors: z.array(AiCheckItemSchema).max(40),
  warnings: z.array(AiCheckItemSchema).max(40),
  recommendations: z.array(AiCheckItemSchema).max(40),
  explanations: z.array(AiCheckItemSchema).max(40),
});
export type AiCheckResult = z.infer<typeof AiCheckResultSchema>;

export type AiCheckResponse =
  | { ok: true; result: AiCheckResult; cached: boolean }
  | { ok: false; code: "unavailable" | "rate_limited" | "invalid" | "error"; message: string };

export interface AiCheckProvider {
  check(snapshot: PanelSnapshot): Promise<AiCheckResult>;
}

export const SNAPSHOT_MAX_BYTES = 60_000;
