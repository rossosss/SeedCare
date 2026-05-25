import { describe, expect, it } from "vitest";
import { generateCareTasks, type PlantCatalogWithStages } from "@/lib/task-generator";

const basePlant = {
  id: "catalog-1",
  type: "пряная зелень",
  difficulty: "EASY",
  description: "test",
  lightRequirement: "много света",
  waterRequirement: "умеренный",
  averageGerminationDays: 7,
  averageHarvestDays: 42,
  recommendedContainer: "горшок",
  sowingDepth: "0.5 см",
  temperature: "20-25°C",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z")
} as const;

describe("task generator", () => {
  it("creates basil-specific pinching tasks", () => {
    const plantCatalog: PlantCatalogWithStages = {
      ...basePlant,
      name: "Базилик Арарат",
      stages: [{ title: "Ждём всходы", stageKey: "WAITING_FOR_SPROUTS", dayFrom: 2, dayTo: 10, order: 1 }]
    };

    const tasks = generateCareTasks({
      userPlantId: "plant-1",
      plantCatalog,
      plantedAt: new Date("2026-01-01T00:00:00Z"),
      place: "WINDOWSILL",
      lightCondition: "FULL_DAY",
      containerType: "SMALL_POT"
    });

    expect(tasks.some((task) => task.taskType === "PINCHING")).toBe(true);
    expect(tasks.some((task) => task.title === "Проверить влажность земли")).toBe(true);
  });

  it("creates microgreen harvest tasks", () => {
    const plantCatalog: PlantCatalogWithStages = {
      ...basePlant,
      name: "Микрозелень редиса",
      type: "микрозелень",
      averageGerminationDays: 2,
      averageHarvestDays: 7,
      stages: [{ title: "Прорастание", stageKey: "WAITING_FOR_SPROUTS", dayFrom: 2, dayTo: 3, order: 1 }]
    };

    const tasks = generateCareTasks({
      userPlantId: "plant-1",
      plantCatalog,
      plantedAt: new Date("2026-01-01T00:00:00Z"),
      place: "WINDOWSILL",
      lightCondition: "FEW_HOURS",
      containerType: "CONTAINER"
    });

    expect(tasks.filter((task) => task.taskType === "HARVEST").length).toBeGreaterThanOrEqual(2);
  });
});
