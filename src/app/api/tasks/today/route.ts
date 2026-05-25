import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const tasks = await prisma.careTask.findMany({
    where: {
      userPlant: {
        userId: user.id
      },
      dueDate: {
        gte: start,
        lt: end
      }
    },
    include: {
      userPlant: {
        select: {
          id: true,
          customName: true,
          plantCatalog: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }]
  });

  return NextResponse.json({ tasks });
}
