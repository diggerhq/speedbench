import { z } from "zod";

export const Signup = z
  .object({
    name: z.string().trim().min(1),
    password: z.string().min(8),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] });

export function validateSignup(form: unknown): { ok: true } | { ok: false; fields: string[] } {
  const r = Signup.safeParse(form);
  if (r.success) return { ok: true };
  return { ok: false, fields: r.error.issues.map((i) => i.path.join(".")) };
}
