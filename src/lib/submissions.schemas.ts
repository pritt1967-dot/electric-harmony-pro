import { z } from "zod";

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9+()\-\s]+$/),
  comment: z.string().trim().max(600).optional().default(""),
});