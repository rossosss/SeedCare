import { notFound } from "next/navigation";
import { PlantCatalogForm } from "@/components/admin/plant-catalog-form";
import { prisma } from "@/lib/prisma";

type EditAdminPlantPageProps = {
  params: {
    id: string;
  };
};

export default async function EditAdminPlantPage({ params }: EditAdminPlantPageProps) {
  const plant = await prisma.plantCatalog.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!plant) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-stone-900">Редактировать растение</h2>
        <p className="mt-2 text-stone-600">{plant.name}</p>
      </div>
      <PlantCatalogForm
        mode="edit"
        initialPlant={{
          id: plant.id,
          name: plant.name,
          type: plant.type,
          difficulty: plant.difficulty,
          description: plant.description,
          lightRequirement: plant.lightRequirement,
          waterRequirement: plant.waterRequirement,
          averageGerminationDays: plant.averageGerminationDays,
          averageHarvestDays: plant.averageHarvestDays,
          recommendedContainer: plant.recommendedContainer,
          sowingDepth: plant.sowingDepth ?? "",
          temperature: plant.temperature ?? "",
          stages: plant.stages.map((stage) => ({
            title: stage.title,
            description: stage.description,
            stageKey: stage.stageKey,
            dayFrom: stage.dayFrom,
            dayTo: stage.dayTo,
            order: stage.order
          }))
        }}
      />
    </div>
  );
}
