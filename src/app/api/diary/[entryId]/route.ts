import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    entryId: string;
  };
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const entry = await prisma.plantDiaryEntry.findFirst({
    where: {
      id: params.entryId,
      userPlant: {
        userId: user.id
      }
    },
    select: { id: true }
  });

  if (!entry) {
    return NextResponse.json({ error: "Запись не найдена." }, { status: 404 });
  }

  await prisma.plantDiaryEntry.delete({
    where: { id: entry.id }
  });

  return NextResponse.json({ ok: true });
}
