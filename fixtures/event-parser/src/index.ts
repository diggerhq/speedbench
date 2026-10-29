import { z } from "zod";

export const Event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("key"), key: z.string().length(1) }),
]);
export type Event = z.infer<typeof Event>;

export function describeEvent(raw: unknown): string {
  const e = Event.parse(raw);
  return e.type === "click" ? `click at ${e.x},${e.y}` : `key ${e.key}`;
}
