import type { PlantCatalog, PlantStage, TaskType } from "@prisma/client";

export type PlantCatalogWithStages = PlantCatalog & {
  stages: Pick<PlantStage, "title" | "stageKey" | "dayFrom" | "dayTo" | "order">[];
};

export type GenerateCareTasksInput = {
  userPlantId: string;
  plantCatalog: PlantCatalogWithStages;
  plantedAt: Date;
  place: string;
  lightCondition: string;
  containerType: string;
};

export type GeneratedCareTask = {
  userPlantId: string;
  title: string;
  description: string;
  dueDate: Date;
  taskType: TaskType;
};

type RuleContext = GenerateCareTasksInput & {
  normalizedName: string;
  normalizedType: string;
  hasGerminationStage: boolean;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function addDaysAtMorning(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(9, 0, 0, 0);
  return result;
}

function createTask(input: GenerateCareTasksInput, dayOffset: number, title: string, description: string, taskType: TaskType): GeneratedCareTask {
  return {
    userPlantId: input.userPlantId,
    title,
    description,
    dueDate: addDaysAtMorning(input.plantedAt, dayOffset),
    taskType
  };
}

function isGreenery(context: RuleContext) {
  return (
    context.normalizedType.includes("зелень") ||
    context.normalizedType.includes("салат") ||
    context.normalizedName.includes("базилик") ||
    context.normalizedName.includes("руккол") ||
    context.normalizedName.includes("петруш")
  );
}

function isBasil(context: RuleContext) {
  return context.normalizedName.includes("базилик");
}

function isMicrogreen(context: RuleContext) {
  return context.normalizedType.includes("микрозелень") || context.normalizedName.includes("микрозелень");
}

function isTomato(context: RuleContext) {
  return context.normalizedName.includes("томат") || context.normalizedName.includes("черри");
}

function needsGermination(context: RuleContext) {
  return context.hasGerminationStage || context.plantCatalog.averageGerminationDays > 0 || !isMicrogreen(context);
}

function createRuleContext(input: GenerateCareTasksInput): RuleContext {
  return {
    ...input,
    normalizedName: normalize(input.plantCatalog.name),
    normalizedType: normalize(input.plantCatalog.type),
    hasGerminationStage: input.plantCatalog.stages.some((stage) => {
      const title = normalize(stage.title);
      return stage.stageKey === "WAITING_FOR_SPROUTS" || title.includes("всход") || title.includes("прорастан");
    })
  };
}

function addBaseTasks(input: GenerateCareTasksInput, context: RuleContext) {
  const tasks: GeneratedCareTask[] = [
    createTask(
      input,
      0,
      "Проверить влажность земли",
      "Потрогайте землю пальцем. Если сверху сухо, немного увлажните.",
      "WATER_CHECK"
    ),
    createTask(
      input,
      0,
      "Поставить в подходящее место",
      "Поставьте растение туда, где ему будет тепло и достаточно светло.",
      "LIGHT"
    )
  ];

  for (let dayOffset = 1; dayOffset <= 6; dayOffset += 1) {
    tasks.push(
      createTask(
        input,
        dayOffset,
        "Проверить влажность земли",
        "Земля должна быть слегка влажной, но не мокрой.",
        "WATER_CHECK"
      )
    );
  }

  if (needsGermination(context)) {
    for (let dayOffset = 0; dayOffset <= 6; dayOffset += 1) {
      tasks.push(
        createTask(
          input,
          dayOffset,
          "Проветрить мини-тепличку",
          "Откройте крышку или плёнку на несколько минут, чтобы не появилась плесень.",
          "VENTILATE"
        )
      );
    }
  }

  return tasks;
}

function addGreeneryTasks(input: GenerateCareTasksInput) {
  return [
    createTask(
      input,
      14,
      "Проверить густоту посадки",
      "Если росткам тесно, оставьте самые крепкие, чтобы им хватало света и места.",
      "THINNING"
    ),
    createTask(
      input,
      28,
      "Можно начинать аккуратно собирать листья",
      "Срезайте понемногу и не оголяйте растение полностью.",
      "HARVEST"
    )
  ];
}

function addBasilTasks(input: GenerateCareTasksInput) {
  return [
    createTask(
      input,
      21,
      "Прищипнуть верхушку",
      "Когда базилик окрепнет, прищипните верхушку, чтобы куст лучше ветвился.",
      "PINCHING"
    ),
    createTask(
      input,
      28,
      "Проверить, нужна ли повторная прищипка",
      "Если базилик вытягивается вверх, аккуратно прищипните верхние побеги.",
      "PINCHING"
    )
  ];
}

function addMicrogreenTasks(input: GenerateCareTasksInput) {
  return [
    createTask(input, 2, "Проверить первые всходы", "Посмотрите, появились ли ростки, и держите поверхность слегка влажной.", "NOTE"),
    createTask(input, 5, "Проверить, можно ли срезать урожай", "Если ростки вытянулись и раскрыли листочки, микрозелень можно срезать.", "HARVEST"),
    createTask(input, 8, "Последний день для срезки микрозелени", "Если ещё не срезали урожай, сделайте это сегодня или завтра.", "HARVEST")
  ];
}

function addTomatoTasks(input: GenerateCareTasksInput) {
  return [
    createTask(input, 14, "Проверить, не пора ли пикировать", "Если появились настоящие листочки и росткам тесно, подготовьте отдельные стаканчики.", "OTHER"),
    createTask(input, 21, "Ещё раз проверить пикировку", "Если томаты вытянулись или стоят густо, пора рассадить их просторнее.", "OTHER"),
    createTask(input, 30, "Подготовить большой горшок", "Для томата понадобится ёмкость от 5 литров и хорошее освещение.", "OTHER"),
    createTask(input, 40, "Проверить, готов ли томат к пересадке", "Если корням тесно, пересадите растение в большой горшок.", "OTHER")
  ];
}

function dedupeTasks(tasks: GeneratedCareTask[]) {
  const seen = new Set<string>();

  return tasks.filter((task) => {
    const key = `${task.title}-${task.dueDate.toISOString()}-${task.taskType}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function generateCareTasks(input: GenerateCareTasksInput): GeneratedCareTask[] {
  const context = createRuleContext(input);
  const tasks = addBaseTasks(input, context);

  if (isGreenery(context)) tasks.push(...addGreeneryTasks(input));
  if (isBasil(context)) tasks.push(...addBasilTasks(input));
  if (isMicrogreen(context)) tasks.push(...addMicrogreenTasks(input));
  if (isTomato(context)) tasks.push(...addTomatoTasks(input));

  return dedupeTasks(tasks).sort((first, second) => first.dueDate.getTime() - second.dueDate.getTime());
}
