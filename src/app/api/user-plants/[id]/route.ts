import { NextResponse } from "next/server";
import type { ContainerType, LightCondition, Place, UserPlantStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getValidationError, parseJson, updateUserPlantSchema } from "@/lib/validation";

type RouteContext = {
  params: { id: string };
};

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function findOwnPlant(userId: string, id: string) {
  return prisma.userPlant.findFirst({
    where: { id, userId },
    select: { id: true }
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const userPlant = await prisma.userPlant.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      plantCatalog: { include: { stages: { orderBy: { order: "asc" } } } },
      careTasks: { orderBy: { dueDate: "asc" } },
      diaryEntries: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!userPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  return NextResponse.json({ userPlant });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const ownPlant = await findOwnPlant(user.id, params.id);

  if (!ownPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  const parsed = updateUserPlantSchema.safeParse(await parseJson(request));

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const body = parsed.data;

  if (body.action === "SPROUTED") {
    const now = new Date();
    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    twoDaysLater.setHours(9, 0, 0, 0);

    const result = await prisma.$transaction(async (tx) => {
      const updatedPlant = await tx.userPlant.update({
        where: { id: ownPlant.id },
        data: { status: "SPROUTED", currentStage: "FIRST_LEAVES" }
      });

      await tx.careTask.createMany({
        data: [
          {
            userPlantId: ownPlant.id,
            title: "Снять плёнку или крышку",
            description: "Когда появились всходы, укрытие больше не нужно. Снимите его аккуратно.",
            dueDate: now,
            taskType: "OTHER"
          },
          {
            userPlantId: ownPlant.id,
            title: "Поставить ближе к свету",
            description: "Всходам нужен хороший свет, чтобы они не вытягивались.",
            dueDate: now,
            taskType: "LIGHT"
          },
          {
            userPlantId: ownPlant.id,
            title: "Поворачивать горшок раз в 2-3 дня",
            description: "Так растение будет расти ровнее и не тянуться в одну сторону.",
            dueDate: twoDaysLater,
            taskType: "NOTE"
          }
        ]
      });

      await tx.plantDiaryEntry.create({
        data: { userPlantId: ownPlant.id, note: "Пользователь отметил, что появились всходы." }
      });

      return updatedPlant;
    });

    return NextResponse.json({ userPlant: result });
  }

  if (body.action === "WATERED") {
    const { start, end } = getTodayRange();
    const result = await prisma.$transaction(async (tx) => {
      await tx.plantDiaryEntry.create({
        data: { userPlantId: ownPlant.id, note: "Пользователь отметил полив." }
      });

      await tx.careTask.updateMany({
        where: {
          userPlantId: ownPlant.id,
          taskType: "WATER_CHECK",
          isCompleted: false,
          dueDate: { gte: start, lt: end }
        },
        data: { isCompleted: true }
      });

      return tx.userPlant.findUnique({ where: { id: ownPlant.id } });
    });

    return NextResponse.json({ userPlant: result });
  }

  if (body.action === "SOIL_STILL_WET") {
    const entry = await prisma.plantDiaryEntry.create({
      data: {
        userPlantId: ownPlant.id,
        note: "Пользователь отметил: земля ещё влажная, полив не нужен."
      }
    });

    return NextResponse.json({ diaryEntry: entry });
  }

  if (body.action === "ADD_NOTE") {
    const note = body.note?.trim();

    if (!note) {
      return NextResponse.json({ error: "Введите текст заметки." }, { status: 400 });
    }

    const entry = await prisma.plantDiaryEntry.create({
      data: { userPlantId: ownPlant.id, note }
    });

    return NextResponse.json({ diaryEntry: entry });
  }

  const data: {
    customName?: string | null;
    status?: UserPlantStatus;
    place?: Place;
    lightCondition?: LightCondition;
    containerType?: ContainerType;
    notes?: string | null;
  } = {};

  if ("customName" in body) data.customName = body.customName ?? null;
  if (body.status) data.status = body.status as UserPlantStatus;
  if (body.place) data.place = body.place as Place;
  if (body.lightCondition) data.lightCondition = body.lightCondition as LightCondition;
  if (body.containerType) data.containerType = body.containerType as ContainerType;
  if ("notes" in body) data.notes = body.notes ?? null;

  const updatedPlant = await prisma.userPlant.update({
    where: { id: ownPlant.id },
    data
  });

  return NextResponse.json({ userPlant: updatedPlant });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const ownPlant = await findOwnPlant(user.id, params.id);

  if (!ownPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  await prisma.userPlant.delete({ where: { id: ownPlant.id } });

  return NextResponse.json({ ok: true });
}
