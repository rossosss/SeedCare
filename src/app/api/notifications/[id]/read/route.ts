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

  const notification = await prisma.notification.findFirst({
    where: {
      id: params.id,
      userId: user.id
    },
    select: { id: true }
  });

  if (!notification) {
    return NextResponse.json({ error: "Уведомление не найдено." }, { status: 404 });
  }

  const updatedNotification = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true }
  });

  return NextResponse.json({ notification: updatedNotification });
}
