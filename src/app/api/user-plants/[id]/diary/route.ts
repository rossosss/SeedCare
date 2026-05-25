import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { diaryEntrySchema, getValidationError, parseJson } from "@/lib/validation";

type RouteContext = {
  params: { id: string };
};

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

  const ownPlant = await findOwnPlant(user.id, params.id);

  if (!ownPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  const entries = await prisma.plantDiaryEntry.findMany({
    where: { userPlantId: ownPlant.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ entries });
}

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const ownPlant = await findOwnPlant(user.id, params.id);

  if (!ownPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  const parsed = diaryEntrySchema.safeParse(await parseJson(request));

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const entry = await prisma.plantDiaryEntry.create({
    data: {
      userPlantId: ownPlant.id,
      note: parsed.data.note,
      imageUrl: parsed.data.imageUrl?.trim() || null
    }
  });

  return NextResponse.json({ entry }, { status: 201 });
}
