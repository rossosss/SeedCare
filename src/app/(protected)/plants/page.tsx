import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PlantCatalogSection } from "@/components/plants/plant-catalog-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/current-user";
import { getGrowingDay, userPlantStatusLabels } from "@/lib/plant-labels";
import { prisma } from "@/lib/prisma";

export default async function PlantsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const [userPlants, catalogPlants] = await Promise.all([
    prisma.userPlant.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        customName: true,
        status: true,
        plantedAt: true,
        plantCatalog: { select: { name: true, type: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.plantCatalog.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        difficulty: true,
        description: true,
        lightRequirement: true,
        waterRequirement: true,
        averageGerminationDays: true,
        averageHarvestDays: true,
        recommendedContainer: true
      }
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Мои растения"
        description="Ваши посадки и каталог семян, которые можно добавить в уход."
        action={<Button href="/plants/new">Посадить новое</Button>}
      />

      <Card>
        <h2 className="text-2xl font-bold text-leaf-700">Что уже растёт</h2>
        <p className="mt-2 text-base leading-7 text-stone-600">
          Откройте растение, чтобы увидеть задачи, этапы и дневник.
        </p>

        <div className="mt-5">
          {userPlants.length === 0 ? (
            <EmptyState
              title="У вас пока нет растений."
              description="Добавьте семена, и приложение подскажет, что делать дальше."
              action={<Button href="/plants/new">Добавить растение</Button>}
            />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {userPlants.map((plant) => (
                <li key={plant.id}>
                  <Link
                    href={`/plants/${plant.id}`}
                    className="block rounded-2xl border border-leaf-100 bg-leaf-50 p-4 transition hover:border-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
                  >
                    <p className="text-lg font-bold text-leaf-700">
                      {plant.customName || plant.plantCatalog.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {plant.plantCatalog.type} · День {getGrowingDay(plant.plantedAt)} ·{" "}
                      {userPlantStatusLabels[plant.status] ?? plant.status}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <PlantCatalogSection plants={catalogPlants} />
    </div>
  );
}
