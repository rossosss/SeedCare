import type { CareTask, PlantCatalog, PlantDiaryEntry, PlantStage, UserPlant } from "@prisma/client";

export type AiPlantAdviceInput = {
  question: string;
  userPlant: UserPlant;
  plantCatalog: PlantCatalog & {
    stages: PlantStage[];
  };
  careTasks: CareTask[];
  diaryEntries: PlantDiaryEntry[];
};

export interface AiProvider {
  generatePlantAdvice(input: AiPlantAdviceInput): Promise<string>;
}

const systemPrompt = [
  "Ты дружелюбный помощник по выращиванию растений дома.",
  "Отвечай простыми словами.",
  "Учитывай данные растения, этап, условия и историю ухода.",
  "Не выдумывай точные диагнозы и не обещай 100% результат.",
  "Давай 2-4 практических шага.",
  "Если вопрос опасный или требует точности, попроси фото или больше данных."
].join(" ");

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildPlantContext(input: AiPlantAdviceInput) {
  const stages = input.plantCatalog.stages
    .map((stage) => `- ${stage.title}: дни ${stage.dayFrom}-${stage.dayTo}. ${stage.description}`)
    .join("\n");

  const tasks = input.careTasks.length
    ? input.careTasks
        .map((task) => `- ${formatDate(task.dueDate)}: ${task.title}. Выполнено: ${task.isCompleted ? "да" : "нет"}`)
        .join("\n")
    : "Задач пока нет.";

  const diary = input.diaryEntries.length
    ? input.diaryEntries
        .map((entry) => `- ${formatDate(entry.createdAt)}: ${entry.note}`)
        .join("\n")
    : "Записей в дневнике пока нет.";

  return [
    `Растение: ${input.plantCatalog.name}`,
    `Тип: ${input.plantCatalog.type}`,
    `Описание: ${input.plantCatalog.description}`,
    `Свет: ${input.plantCatalog.lightRequirement}`,
    `Полив: ${input.plantCatalog.waterRequirement}`,
    `Контейнер: ${input.plantCatalog.recommendedContainer}`,
    `Дата посадки: ${formatDate(input.userPlant.plantedAt)}`,
    `Статус: ${input.userPlant.status}`,
    `Текущий этап: ${input.userPlant.currentStage}`,
    `Место: ${input.userPlant.place}`,
    `Условия света пользователя: ${input.userPlant.lightCondition}`,
    `Контейнер пользователя: ${input.userPlant.containerType}`,
    `Заметки пользователя: ${input.userPlant.notes || "нет"}`,
    "",
    "Этапы выращивания:",
    stages || "Этапы не заданы.",
    "",
    "Ближайшие задачи:",
    tasks,
    "",
    "Последние записи дневника:",
    diary
  ].join("\n");
}

function extractResponseText(response: unknown) {
  const outputText = (response as { output_text?: unknown }).output_text;

  if (typeof outputText === "string" && outputText.trim()) {
    return outputText.trim();
  }

  const output = (response as { output?: unknown }).output;

  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((contentItem) => {
      const text = (contentItem as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

class OpenAiProvider implements AiProvider {
  async generatePlantAdvice(input: AiPlantAdviceInput): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set.");
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions: systemPrompt,
        input: [buildPlantContext(input), "", `Вопрос пользователя: ${input.question}`].join("\n"),
        max_output_tokens: 600
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI request failed: ${errorText}`);
    }

    const data = (await response.json()) as unknown;
    const text = extractResponseText(data);

    if (!text) {
      throw new Error("OpenAI returned an empty response.");
    }

    return text;
  }
}

class MockAiProvider implements AiProvider {
  async generatePlantAdvice(input: AiPlantAdviceInput): Promise<string> {
    console.info("SeedCare AI: OPENAI_API_KEY is not set, using mock AI provider.");

    const plantName = input.plantCatalog.name;
    const question = input.question.toLowerCase();
    const hasWaterQuestion = question.includes("полив") || question.includes("поливать");
    const hasSproutQuestion = question.includes("всход") || question.includes("рост");

    if (hasSproutQuestion) {
      return [
        `${plantName}: пока без паники. Сроки всходов могут немного сдвигаться из-за температуры, глубины посева и влажности.`,
        "1. Проверьте, что земля слегка влажная, но не мокрая.",
        "2. Держите посев в тепле и каждый день ненадолго проветривайте.",
        "3. Если прошло сильно больше обычного срока, аккуратно проверьте глубину посева и свежесть семян.",
        "Если можете, добавьте фото или опишите температуру и место, где стоит горшок."
      ].join("\n");
    }

    if (hasWaterQuestion) {
      return [
        `${plantName}: лучше поливать не по расписанию, а по состоянию земли.`,
        "1. Потрогайте верхний слой пальцем.",
        "2. Если сверху сухо, полейте немного по краю.",
        "3. Если земля влажная, сегодня воду лучше не добавлять.",
        "Следите, чтобы вода не стояла внизу контейнера."
      ].join("\n");
    }

    return [
      `${plantName}: я бы начал с простых проверок.`,
      "1. Посмотрите, хватает ли света и не тянутся ли ростки.",
      "2. Проверьте влажность земли пальцем.",
      "3. Сравните состояние растения с текущим этапом в плане выращивания.",
      "Если есть пятна, плесень или растение резко вянет, лучше добавить фото или описать симптомы подробнее."
    ].join("\n");
  }
}

export function getAiProvider(): AiProvider {
  return process.env.OPENAI_API_KEY ? new OpenAiProvider() : new MockAiProvider();
}

export async function generatePlantAdvice(input: AiPlantAdviceInput) {
  return getAiProvider().generatePlantAdvice(input);
}
