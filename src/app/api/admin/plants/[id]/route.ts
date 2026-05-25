import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/admin";
import { type AdminPlantBody, validatePlantPayload } from "@/server/services/admin-plant.service";

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdminUser();

  if (!admin.ok) return admin.response;

  const payload = validatePlantPayload((await request.json().catch(() => null)) as AdminPlantBody);

  if (!payload.ok) {
    return NextResponse.json({ error: payload.error }, { status: 400 });
  }

  const existingPlant = await prisma.plantCatalog.findUnique({
    where: { id: params.id },
    select: { id: true }
  });

  if (!existingPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  try {
    const plant = await prisma.$transaction(async (tx) => {
      await tx.plantStage.deleteMany({ where: { plantCatalogId: params.id } });

      return tx.plantCatalog.update({
        where: { id: params.id },
        data: {
          name: payload.data.name,
          type: payload.data.type,
          difficulty: payload.data.difficulty,
          description: payload.data.description,
          lightRequirement: payload.data.lightRequirement,
          waterRequirement: payload.data.waterRequirement,
          averageGerminationDays: payload.data.averageGerminationDays,
          averageHarvestDays: payload.data.averageHarvestDays,
          recommendedContainer: payload.data.recommendedContainer,
          sowingDepth: payload.data.sowingDepth,
          temperature: payload.data.temperature,
          stages: { create: payload.data.stages }
        },
        include: { stages: { orderBy: { order: "asc" } } }
      });
    });

    return NextResponse.json({ plant });
  } catch (error) {
    console.error("Admin plant update error", error);
    return NextResponse.json(
      { error: "Не получилось сохранить растение. Возможно, такое название уже есть." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const admin = await requireAdminUser();

  if (!admin.ok) return admin.response;

  try {
    await prisma.plantCatalog.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "Нельзя удалить растение, которое уже добавлено пользователями. Лучше отредактируйте его." },
        { status: 409 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
    }

    console.error("Admin plant delete error", error);
    return NextResponse.json({ error: "Не получилось удалить растение." }, { status: 400 });
  }
}
