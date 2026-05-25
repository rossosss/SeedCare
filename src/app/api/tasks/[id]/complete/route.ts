import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const task = await prisma.careTask.findFirst({
    where: {
      id: params.id,
      userPlant: {
        userId: user.id
      }
    },
    select: { id: true }
  });

  if (!task) {
    return NextResponse.json({ error: "Задача не найдена." }, { status: 404 });
  }

  const updatedTask = await prisma.careTask.update({
    where: { id: task.id },
    data: { isCompleted: true }
  });

  return NextResponse.json({ task: updatedTask });
}
