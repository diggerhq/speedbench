import { z } from "zod";

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(z.enum(["admin", "member"])).nonempty(),
});
export type User = z.infer<typeof User>;

export function parseUsers(body: unknown): User[] {
  return z.array(User).parse(body);
}
