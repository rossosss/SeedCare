import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "@/lib/auth";

describe("auth helpers", () => {
  it("normalizes emails", () => {
    expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("validates common email shapes", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });
});
