import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { difficultyLabels } from "@/lib/plant-labels";

export type PlantCatalogCardData = {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  description: string;
  lightRequirement: string;
  waterRequirement: string;
  averageGerminationDays: number;
  averageHarvestDays: number;
  recommendedContainer: string;
};

type PlantCatalogCardProps = {
  plant: PlantCatalogCardData;
};

function formatDays(days: number) {
  return `примерно ${days} дн.`;
}

export function PlantCatalogCard({ plant }: PlantCatalogCardProps) {
  return (
    <Card className="flex h-full flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{plant.type}</Badge>
          <Badge tone="yellow">Сложность: {difficultyLabels[plant.difficulty] ?? plant.difficulty}</Badge>
        </div>
        <h3 className="mt-4 text-2xl font-bold text-leaf-700">{plant.name}</h3>
        <p className="mt-3 text-base leading-7 text-stone-600">{plant.description}</p>
      </div>

      <dl className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
        <div className="rounded-2xl bg-leaf-50 p-3">
          <dt className="font-semibold text-leaf-700">Свет</dt>
          <dd className="mt-1">{plant.lightRequirement}</dd>
        </div>
        <div className="rounded-2xl bg-leaf-50 p-3">
          <dt className="font-semibold text-leaf-700">Полив</dt>
          <dd className="mt-1">{plant.waterRequirement}</dd>
        </div>
        <div className="rounded-2xl bg-leaf-50 p-3">
          <dt className="font-semibold text-leaf-700">Всходы</dt>
          <dd className="mt-1">{formatDays(plant.averageGerminationDays)}</dd>
        </div>
        <div className="rounded-2xl bg-leaf-50 p-3">
          <dt className="font-semibold text-leaf-700">Урожай</dt>
          <dd className="mt-1">{formatDays(plant.averageHarvestDays)}</dd>
        </div>
        <div className="rounded-2xl bg-leaf-50 p-3 sm:col-span-2">
          <dt className="font-semibold text-leaf-700">Контейнер</dt>
          <dd className="mt-1">{plant.recommendedContainer}</dd>
        </div>
      </dl>

      <Button href={`/plants/new?plantId=${plant.id}`} className="mt-auto w-full">
        Посадить
      </Button>
    </Card>
  );
}
