import { z } from "zod";

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, "Слишком длинный текст.")
    .optional()
    .nullable()
    .transform((value) => value || null);

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Введите имя.").max(100, "Имя слишком длинное."),
  email: z.string().trim().toLowerCase().email("Введите корректный email.").max(255),
  password: z.string().min(8, "Пароль должен быть не короче 8 символов.").max(200)
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email.").max(255),
  password: z.string().min(1, "Введите пароль.").max(200)
});

export const createUserPlantSchema = z.object({
  plantCatalogId: z.string().trim().min(1, "Выберите растение из каталога."),
  customName: optionalText(120),
  place: z.enum(["WINDOWSILL", "BALCONY", "GROW_LIGHT_SHELF", "UNKNOWN"], { message: "Выберите место выращивания." }),
  lightCondition: z.enum(["FULL_DAY", "FEW_HOURS", "LOW_LIGHT", "UNKNOWN"], { message: "Выберите количество света." }),
  containerType: z.enum(["SMALL_POT", "LONG_BOX", "CONTAINER", "NOT_READY"], { message: "Выберите контейнер." }),
  notes: optionalText(1000)
});

export const updateUserPlantSchema = z.object({
  action: z.enum(["SPROUTED", "WATERED", "SOIL_STILL_WET", "ADD_NOTE"]).optional(),
  customName: optionalText(120),
  status: z.enum(["PLANNED", "SOWED", "GROWING", "WAITING_FOR_SPROUTS", "SPROUTED", "HARVESTING", "FINISHED", "ARCHIVED"]).optional(),
  place: z.enum(["WINDOWSILL", "BALCONY", "GROW_LIGHT_SHELF", "UNKNOWN"]).optional(),
  lightCondition: z.enum(["FULL_DAY", "FEW_HOURS", "LOW_LIGHT", "UNKNOWN"]).optional(),
  containerType: z.enum(["SMALL_POT", "LONG_BOX", "CONTAINER", "NOT_READY"]).optional(),
  notes: optionalText(1000),
  note: z.string().trim().max(1000, "Заметка слишком длинная.").optional()
});

export const diaryEntrySchema = z.object({
  note: z.string().trim().min(1, "Введите текст заметки.").max(1000, "Заметка слишком длинная."),
  imageUrl: z.string().trim().url("Некорректная ссылка на изображение.").max(1000).optional().nullable()
});

export const aiAdviceSchema = z.object({
  userPlantId: z.string().trim().min(1, "Не найдено растение для вопроса."),
  question: z.string().trim().min(1, "Напишите вопрос помощнику.").max(1000, "Сделайте вопрос короче, до 1000 символов.")
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Введите имя.").max(100, "Имя слишком длинное."),
  city: optionalText(120),
  country: optionalText(120),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  careMode: z.enum(["SIMPLE", "EXPERT"]).default("SIMPLE")
});

export const adminPlantSchema = z.object({
  name: z.string().trim().min(1, "Введите название растения.").max(160),
  type: z.string().trim().min(1, "Введите тип растения.").max(120),
  difficulty: z.enum(["VERY_EASY", "EASY", "MEDIUM", "HARD"], { message: "Выберите сложность." }),
  description: z.string().trim().min(1, "Введите описание.").max(2000),
  lightRequirement: z.string().trim().min(1, "Введите требования к свету.").max(300),
  waterRequirement: z.string().trim().min(1, "Введите требования к поливу.").max(300),
  averageGerminationDays: z.coerce.number().int().min(0, "Укажите срок всходов.").max(365),
  averageHarvestDays: z.coerce.number().int().min(0, "Укажите срок урожая.").max(2000),
  recommendedContainer: z.string().trim().min(1, "Введите рекомендованный контейнер.").max(300),
  sowingDepth: optionalText(120),
  temperature: optionalText(120),
  stages: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Введите название этапа.").max(160),
        description: z.string().trim().min(1, "Введите описание этапа.").max(1000),
        stageKey: z.enum(["SOWING", "WAITING_FOR_SPROUTS", "FIRST_LEAVES", "GROWTH", "PINCHING", "HARVEST", "CUSTOM"]),
        dayFrom: z.coerce.number().int().min(0),
        dayTo: z.coerce.number().int().min(0),
        order: z.coerce.number().int().min(1).optional()
      })
    )
    .min(1, "Добавьте хотя бы один этап выращивания.")
}).transform((plant) => ({
  ...plant,
  stages: plant.stages.map((stage, index) => ({ ...stage, order: index + 1 }))
}));

export function getValidationError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Проверьте данные формы.";
  }

  return "Проверьте данные формы.";
}

export function parseJson(request: Request) {
  return request.json().catch(() => null);
}
