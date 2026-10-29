import { describe, expect, it } from "vitest";
import { describeEvent } from "../src/index";

describe("describeEvent", () => {
  it("describes a click", () => {
    expect(describeEvent({ type: "click", x: 1, y: 2 })).toBe("click at 1,2");
  });
  it("describes a key", () => {
    expect(describeEvent({ type: "key", key: "a" })).toBe("key a");
  });
  it("rejects an unknown type", () => {
    expect(() => describeEvent({ type: "scroll" })).toThrow();
  });
});
