import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { DeletePlantButton } from "@/components/admin/delete-plant-button";

function formatDifficulty(difficulty: string) {
  const labels: Record<string, string> = {
    VERY_EASY: "очень легко",
    EASY: "легко",
    MEDIUM: "средне",
    HARD: "сложно"
  };

  return labels[difficulty] ?? difficulty;
}

export default async function AdminPlantsPage() {
  const plants = await prisma.plantCatalog.findMany({
    include: {
      stages: {
        orderBy: { order: "asc" }
      }
    },
    orderBy: [{ type: "asc" }, { name: "asc" }]
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Растения каталога</h2>
          <p className="mt-2 text-stone-600">Создавайте и обновляйте культуры, которые видят пользователи.</p>
        </div>
        <Link
          href="/admin/plants/new"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-leaf-700 px-5 py-3 font-semibold text-white hover:bg-leaf-500"
        >
          Добавить растение
        </Link>
      </div>

      {plants.length === 0 ? (
        <Card>
          <p className="text-lg font-semibold text-stone-700">Каталог пуст.</p>
          <p className="mt-2 text-stone-600">Добавьте первое растение или запустите seed script.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plants.map((plant) => (
            <Card key={plant.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-leaf-700">{plant.name}</h3>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-stone-500">
                    {plant.type} · {formatDifficulty(plant.difficulty)}
                  </p>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-stone-600">{plant.description}</p>
                  <div className="mt-4 grid gap-2 text-sm text-stone-700 sm:grid-cols-2 lg:grid-cols-4">
                    <p><span className="font-semibold">Свет:</span> {plant.lightRequirement}</p>
                    <p><span className="font-semibold">Полив:</span> {plant.waterRequirement}</p>
                    <p><span className="font-semibold">Всходы:</span> {plant.averageGerminationDays} дн.</p>
                    <p><span className="font-semibold">Этапов:</span> {plant.stages.length}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/plants/${plant.id}/edit`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-leaf-100 bg-white px-4 py-2 font-semibold text-leaf-700 hover:border-leaf-500"
                  >
                    Редактировать
                  </Link>
                  <DeletePlantButton plantId={plant.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
