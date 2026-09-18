import { z } from "zod";

export const REVIEW_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const REVIEW_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const clientReviewSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя").max(80),
  location: z.string().trim().min(2, "Укажите посёлок или район").max(80),
  rating: z.number().int().min(1).max(5),
  text: z
    .string()
    .trim()
    .min(30, "Отзыв должен быть не короче 30 символов")
    .max(2000),
  consent: z.literal(true),
  /** Honeypot: должен остаться пустым. */
  website: z.string().max(0).optional().default(""),
  /** Сколько миллисекунд форма была открыта (анти-бот). */
  elapsedMs: z.number().int().min(0).max(1000 * 60 * 60 * 6),
  photo: z
    .object({
      type: z.enum(REVIEW_PHOTO_TYPES),
      dataBase64: z.string().max(Math.ceil(REVIEW_PHOTO_MAX_BYTES * 1.4)),
    })
    .nullable()
    .optional()
    .default(null),
});

export type ClientReviewInput = z.infer<typeof clientReviewSchema>;

export type ReviewStatus = "pending" | "published" | "rejected";

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: "На модерации",
  published: "Опубликован",
  rejected: "Отклонён",
};
