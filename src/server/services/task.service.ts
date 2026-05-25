import type { Prisma, UserPlant } from "@prisma/client";
import {
  generateCareTasks,
  type GenerateCareTasksInput,
  type GeneratedCareTask
} from "@/lib/task-generator";

export type TaskServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function buildInitialCareTasks(input: GenerateCareTasksInput): GeneratedCareTask[] {
  return generateCareTasks(input);
}

export async function createInitialCareTasks(
  tx: Prisma.TransactionClient,
  input: GenerateCareTasksInput
) {
  const tasks = buildInitialCareTasks(input);

  if (tasks.length === 0) {
    return { count: 0 };
  }

  return tx.careTask.createMany({
    data: tasks
  });
}

export async function createInitialCareTasksForUserPlant(
  tx: Prisma.TransactionClient,
  userPlant: UserPlant,
  plantCatalog: GenerateCareTasksInput["plantCatalog"]
) {
  return createInitialCareTasks(tx, {
    userPlantId: userPlant.id,
    plantCatalog,
    plantedAt: userPlant.plantedAt,
    place: userPlant.place,
    lightCondition: userPlant.lightCondition,
    containerType: userPlant.containerType
  });
}
