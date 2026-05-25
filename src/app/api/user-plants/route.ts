import { NextResponse } from "next/server";
import type { ContainerType, LightCondition, Place } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getValidationError, createUserPlantSchema, parseJson } from "@/lib/validation";
import { createUserPlantWithInitialTasks } from "@/server/services/user-plant.service";
import { canCreatePlant } from "@/server/services/subscription.service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const userPlants = await prisma.userPlant.findMany({
    where: { userId: user.id },
    include: {
      plantCatalog: true,
      careTasks: {
        where: { isCompleted: false },
        orderBy: { dueDate: "asc" },
        take: 3
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ userPlants });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const parsed = createUserPlantSchema.safeParse(await parseJson(request));

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const plantAccess = await canCreatePlant(user.id);

  if (!plantAccess.ok) {
    return NextResponse.json(
      {
        error: plantAccess.reason,
        code: "PLANT_LIMIT_REACHED",
        paywall: plantAccess.reason,
        plan: plantAccess.plan,
        limit: plantAccess.limit,
        used: plantAccess.used
      },
      { status: 402 }
    );
  }

  const result = await createUserPlantWithInitialTasks({
    userId: user.id,
    plantCatalogId: parsed.data.plantCatalogId,
    customName: parsed.data.customName,
    place: parsed.data.place as Place,
    lightCondition: parsed.data.lightCondition as LightCondition,
    containerType: parsed.data.containerType as ContainerType,
    notes: parsed.data.notes
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ userPlant: result.data }, { status: 201 });
}
