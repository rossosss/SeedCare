import { describe, expect, it } from "vitest";
import { adminPlantSchema, aiAdviceSchema, registerSchema } from "@/lib/validation";

describe("api validation schemas", () => {
  it("requires strong enough register payload", () => {
    expect(registerSchema.safeParse({ name: "Анна", email: "anna@example.com", password: "12345678" }).success).toBe(true);
    expect(registerSchema.safeParse({ name: "", email: "bad", password: "123" }).success).toBe(false);
  });

  it("limits AI question length", () => {
    expect(aiAdviceSchema.safeParse({ userPlantId: "p1", question: "Когда поливать?" }).success).toBe(true);
    expect(aiAdviceSchema.safeParse({ userPlantId: "p1", question: "x".repeat(1001) }).success).toBe(false);
  });

  it("validates admin plant stages", () => {
    const parsed = adminPlantSchema.safeParse({
      name: "Базилик",
      type: "зелень",
      difficulty: "EASY",
      description: "Описание",
      lightRequirement: "много света",
      waterRequirement: "умеренный",
      averageGerminationDays: 7,
      averageHarvestDays: 42,
      recommendedContainer: "горшок",
      stages: [
        { title: "Посев", description: "Посеять", stageKey: "SOWING", dayFrom: 1, dayTo: 1 }
      ]
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.stages[0].order).toBe(1);
    }
  });
});
