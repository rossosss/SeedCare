import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getGrowingDay } from "@/lib/plant-labels";

type PlantPreview = {
  id: string;
  name: string;
  status: string;
  plantedAt: Date;
};

type UserPlantsPreviewProps = {
  plants: PlantPreview[];
};

export function UserPlantsPreview({ plants }: UserPlantsPreviewProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-leaf-700">Мои растения</h2>
      <p className="mt-2 text-base leading-7 text-stone-600">
        Всё, что уже растёт у вас дома.
      </p>
      <div className="mt-5">
        {plants.length === 0 ? (
          <EmptyState
            title="У вас пока нет растений."
            description="Добавьте семена, и приложение подскажет, что делать дальше."
            action={
              <Button href="/plants/new" className="w-full sm:w-auto">
                Посадить новое растение
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {plants.map((plant) => (
              <li key={plant.id}>
                <Link
                  href={`/plants/${plant.id}`}
                  className="block rounded-2xl border border-leaf-100 bg-leaf-50 p-4 transition hover:border-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
                >
                  <p className="font-bold text-leaf-700">{plant.name}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    День {getGrowingDay(plant.plantedAt)} · {plant.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
