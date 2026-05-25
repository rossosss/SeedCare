import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getWeatherForecast, type WeatherForecast } from "@/server/services/weather.service";

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  dedupeKey: string;
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

async function createNotificationOnce(input: CreateNotificationInput) {
  return prisma.notification.upsert({
    where: {
      userId_dedupeKey: {
        userId: input.userId,
        dedupeKey: input.dedupeKey
      }
    },
    update: {},
    create: input
  });
}

export async function generateTaskDueNotifications(userId: string) {
  const { start, end } = getTodayRange();
  const taskCount = await prisma.careTask.count({
    where: {
      userPlant: { userId },
      isCompleted: false,
      dueDate: {
        gte: start,
        lt: end
      }
    }
  });

  if (taskCount === 0) {
    return null;
  }

  return createNotificationOnce({
    userId,
    title: "Есть задачи на сегодня",
    message: `Сегодня нужно выполнить задач: ${taskCount}.`,
    type: "TASK_DUE",
    dedupeKey: `task-due:${getTodayKey()}`
  });
}

export async function generateWeatherNotifications(userId: string, weather?: WeatherForecast | null) {
  if (!weather || weather.plantWarnings.length === 0) {
    return [];
  }

  return Promise.all(
    weather.plantWarnings.map((warning, index) =>
      createNotificationOnce({
        userId,
        title: "Погодное предупреждение",
        message: warning,
        type: "WEATHER_WARNING",
        dedupeKey: `weather:${getTodayKey()}:${index}:${warning.slice(0, 32)}`
      })
    )
  );
}

export async function generatePlantStageNotifications(userId: string) {
  const today = getTodayKey();
  const plants = await prisma.userPlant.findMany({
    where: { userId },
    include: {
      plantCatalog: {
        include: {
          stages: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  const notifications = [];

  for (const plant of plants) {
    const day = Math.max(1, Math.floor((Date.now() - plant.plantedAt.getTime()) / 86_400_000) + 1);
    const stage = plant.plantCatalog.stages.find((item) => day >= item.dayFrom && day <= item.dayTo);

    if (!stage || stage.stageKey === plant.currentStage) {
      continue;
    }

    notifications.push(
      createNotificationOnce({
        userId,
        title: "Новый этап растения",
        message: `${plant.customName || plant.plantCatalog.name}: возможно, пора перейти к этапу “${stage.title}”.`,
        type: "PLANT_STAGE",
        dedupeKey: `plant-stage:${today}:${plant.id}:${stage.stageKey}`
      })
    );
  }

  return Promise.all(notifications);
}

export async function generateNotificationsForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      city: true,
      country: true,
      latitude: true,
      longitude: true
    }
  });

  let weather: WeatherForecast | null = null;

  if (user && (user.city || (typeof user.latitude === "number" && typeof user.longitude === "number"))) {
    try {
      weather = await getWeatherForecast(user);
    } catch (error) {
      console.error("SeedCare notification weather error", error);
    }
  }

  await Promise.all([
    generateTaskDueNotifications(userId),
    generateWeatherNotifications(userId, weather),
    generatePlantStageNotifications(userId)
  ]);
}
