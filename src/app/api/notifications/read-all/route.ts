import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId: user.id,
      isRead: false
    },
    data: { isRead: true }
  });

  return NextResponse.json({ updatedCount: result.count });
}
