import { z } from "zod";

export const Config = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(3000),
  host: z.string().default("0.0.0.0"),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
});
export type Config = z.infer<typeof Config>;

export function loadConfig(input: Record<string, unknown>): Config {
  return Config.parse(input);
}
