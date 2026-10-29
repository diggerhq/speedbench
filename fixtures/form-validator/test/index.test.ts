import { describe, expect, it } from "vitest";
import { validateSignup } from "../src/index";

describe("validateSignup", () => {
  it("accepts a valid form", () => {
    expect(validateSignup({ name: "Ada", password: "longenough", confirm: "longenough" })).toEqual({ ok: true });
  });
  it("flags a short password", () => {
    expect(validateSignup({ name: "Ada", password: "short", confirm: "short" })).toEqual({ ok: false, fields: ["password"] });
  });
  it("flags a mismatch", () => {
    expect(validateSignup({ name: "Ada", password: "longenough", confirm: "different" })).toEqual({ ok: false, fields: ["confirm"] });
  });
});
