import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { PlantAiAssistant } from "@/components/plants/plant-ai-assistant";
import { PlantDiary } from "@/components/plants/plant-diary";
import { PlantQuickActions } from "@/components/plants/plant-quick-actions";
import { CompleteTaskButton } from "@/components/tasks/complete-task-button";
import { getCurrentUser } from "@/lib/current-user";
import {
  containerLabels,
  getGrowingDay,
  lightLabels,
  placeLabels,
  stageLabels,
  userPlantStatusLabels
} from "@/lib/plant-labels";
import { prisma } from "@/lib/prisma";

type PlantDetailsPageProps = {
  params: { id: string };
};

function getTodayStart() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default async function PlantDetailsPage({ params }: PlantDetailsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const plant = await prisma.userPlant.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      plantCatalog: {
        include: {
          stages: { orderBy: { order: "asc" } }
        }
      },
      careTasks: {
        where: { isCompleted: false, dueDate: { gte: getTodayStart() } },
        orderBy: { dueDate: "asc" },
        take: 8
      },
      diaryEntries: {
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });

  if (!plant) {
    notFound();
  }

  const title = plant.customName || plant.plantCatalog.name;
  const growingDay = getGrowingDay(plant.plantedAt);
  const currentStage = stageLabels[plant.currentStage] ?? userPlantStatusLabels[plant.status] ?? plant.status;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`День ${growingDay}. Сейчас этап: ${currentStage}.`}
      />

      <Card className="bg-leaf-700 text-white">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="yellow">{userPlantStatusLabels[plant.status] ?? plant.status}</Badge>
              <Badge tone="neutral">День {growingDay}</Badge>
              <Badge tone="neutral">{plant.plantCatalog.type}</Badge>
            </div>
            <h2 className="mt-5 text-3xl font-bold">{plant.plantCatalog.name}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-leaf-50">
              {plant.plantCatalog.description}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <h3 className="text-lg font-bold">Условия</h3>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-leaf-50">Где растёт</dt>
                <dd className="font-semibold">{placeLabels[plant.place]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-leaf-50">Свет</dt>
                <dd className="font-semibold">{lightLabels[plant.lightCondition]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-leaf-50">Контейнер</dt>
                <dd className="font-semibold">{containerLabels[plant.containerType]}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-leaf-50">Дата посадки</dt>
                <dd className="font-semibold">{plant.plantedAt.toLocaleDateString("ru-RU")}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-bold text-leaf-700">Что сделать сегодня</h2>
          <p className="mt-2 text-stone-600">Ближайшие невыполненные задачи по этому растению.</p>

          {plant.careTasks.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="Ближайших задач нет."
                description="Можно просто посмотреть на растение и проверить землю пальцем."
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {plant.careTasks.map((task) => (
                <li key={task.id} className="rounded-2xl bg-leaf-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-leaf-700">{task.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{task.description}</p>
                      <p className="mt-2 text-xs font-semibold text-stone-500">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <CompleteTaskButton taskId={task.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-leaf-700">Быстрые действия</h2>
          <p className="mt-2 text-stone-600">
            Отметьте простое событие. Запись сохранится в дневнике растения.
          </p>
          <div className="mt-5">
            <PlantQuickActions plantId={plant.id} />
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="text-2xl font-bold text-leaf-700">План выращивания</h2>
        <p className="mt-2 text-stone-600">Так будет развиваться растение, если условия подходят.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {plant.plantCatalog.stages.map((stage) => (
            <li
              key={stage.id}
              className={`rounded-2xl border p-4 ${
                stage.stageKey === plant.currentStage ? "border-leaf-700 bg-leaf-50" : "border-leaf-100 bg-white"
              }`}
            >
              <p className="font-bold text-leaf-700">{stage.title}</p>
              <p className="mt-1 text-sm text-stone-500">День {stage.dayFrom}-{stage.dayTo}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{stage.description}</p>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-leaf-700">Дневник</h2>
        <p className="mt-2 text-stone-600">
          Записывайте важные моменты: полив, всходы, перестановку к свету и первые листья.
        </p>
        <div className="mt-5">
          <PlantDiary
            plantId={plant.id}
            initialEntries={plant.diaryEntries.map((entry) => ({
              id: entry.id,
              note: entry.note,
              imageUrl: entry.imageUrl,
              createdAt: entry.createdAt.toISOString()
            }))}
          />
        </div>
      </Card>

      <Card>
        <PlantAiAssistant plantId={plant.id} />
      </Card>
    </div>
  );
}
