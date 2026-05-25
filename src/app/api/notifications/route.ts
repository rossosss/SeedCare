import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { generateNotificationsForUser } from "@/server/services/notification.service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  await generateNotificationsForUser(user.id);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false
    }
  });

  return NextResponse.json({ notifications, unreadCount });
}
