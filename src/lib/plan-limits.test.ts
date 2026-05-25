import { describe, expect, it } from "vitest";
import { canCreatePlantForUsage, getRemainingAiRequests, hasFeature } from "@/lib/plan-limits";

describe("plan limits", () => {
  it("limits FREE plants to 5 active plants", () => {
    expect(canCreatePlantForUsage("FREE", 4)).toBe(true);
    expect(canCreatePlantForUsage("FREE", 5)).toBe(false);
  });

  it("does not limit PRO plant count", () => {
    expect(canCreatePlantForUsage("PRO", 500)).toBe(true);
  });

  it("calculates monthly AI requests", () => {
    expect(getRemainingAiRequests("FREE", 1)).toBe(2);
    expect(getRemainingAiRequests("FREE", 3)).toBe(0);
    expect(getRemainingAiRequests("PRO", 999)).toBeNull();
  });

  it("keeps weather warnings out of FREE", () => {
    expect(hasFeature("FREE", "WEATHER_WARNINGS")).toBe(false);
    expect(hasFeature("PLUS", "WEATHER_WARNINGS")).toBe(true);
  });
});
