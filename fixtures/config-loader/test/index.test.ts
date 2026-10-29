import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/index";

describe("loadConfig", () => {
  it("applies defaults", () => {
    expect(loadConfig({})).toEqual({ port: 3000, host: "0.0.0.0", logLevel: "info" });
  });
  it("coerces the port", () => {
    expect(loadConfig({ port: "8080" }).port).toBe(8080);
  });
  it("rejects an unknown log level", () => {
    expect(() => loadConfig({ logLevel: "loud" })).toThrow();
  });
});
