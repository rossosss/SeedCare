import { PageHeader } from "@/components/layout/page-header";
import { NewPlantWizard } from "@/components/plants/new-plant-wizard";
import { prisma } from "@/lib/prisma";

type NewPlantPageProps = {
  searchParams: { plantId?: string };
};

export default async function NewPlantPage({ searchParams }: NewPlantPageProps) {
  const catalogPlants = await prisma.plantCatalog.findMany({
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
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Посадить новое растение"
        description="Ответьте на несколько простых вопросов, и SeedCare создаст персональный план ухода."
      />
      <NewPlantWizard catalogPlants={catalogPlants} initialPlantId={searchParams.plantId} />
    </div>
  );
}
