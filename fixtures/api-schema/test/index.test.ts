import { describe, expect, it } from "vitest";
import { parseUsers } from "../src/index";

const ok = { id: "5f1c2b8e-3d4a-4c6b-9e7f-1a2b3c4d5e6f", email: "a@b.co", roles: ["admin"] };

describe("parseUsers", () => {
  it("parses a valid list", () => {
    expect(parseUsers([ok])).toHaveLength(1);
  });
  it("rejects a bad email", () => {
    expect(() => parseUsers([{ ...ok, email: "nope" }])).toThrow();
  });
  it("rejects empty roles", () => {
    expect(() => parseUsers([{ ...ok, roles: [] }])).toThrow();
  });
});
