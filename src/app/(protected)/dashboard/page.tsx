import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ImportantReminders } from "@/components/notifications/important-reminders";
import { UserPlantsPreview } from "@/components/plants/user-plants-preview";
import { DailyTipCard } from "@/components/tasks/daily-tip-card";
import { TodayTasksPreview } from "@/components/tasks/today-tasks-preview";
import { WeatherCard } from "@/components/weather/weather-card";
import { getCurrentUser } from "@/lib/current-user";
import { userPlantStatusLabels } from "@/lib/plant-labels";
import { prisma } from "@/lib/prisma";
import { generateNotificationsForUser } from "@/server/services/notification.service";
import { getWeatherForecast } from "@/server/services/weather.service";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function getDashboardWeather(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  if (!user.city && (typeof user.latitude !== "number" || typeof user.longitude !== "number")) {
    return { locationConfigured: false as const };
  }

  try {
    const weather = await getWeatherForecast({
      city: user.city,
      country: user.country,
      latitude: user.latitude,
      longitude: user.longitude
    });

    return {
      locationConfigured: true as const,
      currentTemp: weather.currentTemp,
      condition: weather.condition,
      plantWarnings: weather.plantWarnings,
      provider: weather.provider
    };
  } catch (error) {
    console.error("SeedCare dashboard weather error", error);
    return {
      locationConfigured: true as const,
      currentTemp: 22,
      condition: "погода временно недоступна",
      plantWarnings: ["Не получилось обновить погоду. Проверьте растения обычным способом."],
      provider: "mock"
    };
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  await generateNotificationsForUser(user.id);
  const { start, end } = getTodayRange();

  const [tasks, plants, weather, reminders] = await Promise.all([
    prisma.careTask.findMany({
      where: {
        userPlant: { userId: user.id },
        dueDate: { gte: start, lt: end },
        isCompleted: false
      },
      select: { id: true, title: true, description: true },
      orderBy: { dueDate: "asc" },
      take: 5
    }),
    prisma.userPlant.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        customName: true,
        status: true,
        plantedAt: true,
        plantCatalog: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    getDashboardWeather(user),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return (
    <div className="space-y-7">
      <PageHeader
        title={`Добро пожаловать, ${user.name}`}
        description="Здесь видно, что нужно сделать сегодня и как чувствуют себя ваши растения."
        action={
          <Button href="/plants/new" className="w-full sm:w-auto">
            Посадить новое растение
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-[1fr_320px]">
        <Card className="bg-leaf-700 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-leaf-700">
                Домашняя ферма
              </p>
              <h2 className="mt-3 text-2xl font-bold text-gray-400">Начните с простого осмотра</h2>
              <p className="mt-2 max-w-xl text-leaf-500">
                Проверьте землю пальцем, посмотрите на свет и выполните задачи на сегодня.
              </p>
            </div>
            <Badge tone="yellow">{user.careMode === "EXPERT" ? "Опытный режим" : "Простой режим"}</Badge>
          </div>
        </Card>

        <WeatherCard weather={weather} />
      </section>

      <ImportantReminders reminders={reminders} />

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <TodayTasksPreview tasks={tasks} />
        <DailyTipCard />
      </section>

      <UserPlantsPreview
        plants={plants.map((plant) => ({
          id: plant.id,
          name: plant.customName || plant.plantCatalog.name,
          status: userPlantStatusLabels[plant.status] ?? plant.status,
          plantedAt: plant.plantedAt
        }))}
      />
    </div>
  );
}
