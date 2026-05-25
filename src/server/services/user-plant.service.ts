import type { ContainerType, LightCondition, Place } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createInitialCareTasksForUserPlant } from "@/server/services/task.service";

export type CreateUserPlantInput = {
  userId: string;
  plantCatalogId: string;
  customName?: string | null;
  place: Place;
  lightCondition: LightCondition;
  containerType: ContainerType;
  notes?: string | null;
};

export async function createUserPlantWithInitialTasks(input: CreateUserPlantInput) {
  const catalogPlant = await prisma.plantCatalog.findUnique({
    where: { id: input.plantCatalogId },
    include: {
      stages: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!catalogPlant) {
    return {
      ok: false as const,
      error: "Такого растения нет в каталоге."
    };
  }

  const plantedAt = new Date();

  const userPlant = await prisma.$transaction(async (tx) => {
    const createdPlant = await tx.userPlant.create({
      data: {
        userId: input.userId,
        plantCatalogId: catalogPlant.id,
        customName: input.customName?.trim() || null,
        status: "SOWED",
        currentStage: "SOWING",
        plantedAt,
        place: input.place,
        lightCondition: input.lightCondition,
        containerType: input.containerType,
        notes: input.notes?.trim() || null
      },
      include: {
        plantCatalog: true
      }
    });

    await createInitialCareTasksForUserPlant(tx, createdPlant, catalogPlant);

    return createdPlant;
  });

  return {
    ok: true as const,
    data: userPlant
  };
}
