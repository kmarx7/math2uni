import { z } from "zod";
export const loginSchema = z
  .object({
    email: z
      .email()
      .max(254)
      .transform((x) => x.trim().toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();
export const signupSchema = loginSchema.extend({
  password: z
    .string()
    .min(10)
    .max(128)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});
