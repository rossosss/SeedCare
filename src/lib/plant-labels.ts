export const userPlantStatusLabels: Record<string, string> = {
  PLANNED: "Запланировано",
  SOWED: "Посев",
  GROWING: "Растёт",
  WAITING_FOR_SPROUTS: "Ждём всходы",
  SPROUTED: "Появились всходы",
  HARVESTING: "Можно собирать",
  FINISHED: "Завершено",
  ARCHIVED: "В архиве"
};

export const stageLabels: Record<string, string> = {
  SOWING: "Посев",
  WAITING_FOR_SPROUTS: "Ждём всходы",
  FIRST_LEAVES: "Первые листочки",
  GROWTH: "Рост куста",
  PINCHING: "Прищипка",
  HARVEST: "Урожай",
  CUSTOM: "Уход"
};

export const placeLabels: Record<string, string> = {
  WINDOWSILL: "Подоконник",
  BALCONY: "Балкон",
  GROW_LIGHT_SHELF: "Стеллаж с лампой",
  UNKNOWN: "Пока не знаю"
};

export const lightLabels: Record<string, string> = {
  FULL_DAY: "Много, весь день",
  FEW_HOURS: "Несколько часов",
  LOW_LIGHT: "Мало света",
  UNKNOWN: "Не знаю"
};

export const containerLabels: Record<string, string> = {
  SMALL_POT: "Маленький горшок",
  LONG_BOX: "Длинный ящик",
  CONTAINER: "Контейнер",
  NOT_READY: "Пока ничего нет"
};

export const difficultyLabels: Record<string, string> = {
  VERY_EASY: "очень легко",
  EASY: "легко",
  MEDIUM: "средне",
  HARD: "сложно"
};

export function getGrowingDay(plantedAt: Date) {
  const diff = Date.now() - plantedAt.getTime();
  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
}
