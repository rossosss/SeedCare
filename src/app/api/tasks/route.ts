import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function parseDate(value: string | null, fallback: Date) {
  if (!value) {
    return fallback;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const url = new URL(request.url);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const from = parseDate(url.searchParams.get("from"), today);
  const to = endOfDay(parseDate(url.searchParams.get("to"), addDays(today, 14)));
  const completed = url.searchParams.get("completed");

  const tasks = await prisma.careTask.findMany({
    where: {
      userPlant: {
        userId: user.id
      },
      dueDate: {
        gte: from,
        lte: to
      },
      ...(completed === "true" ? { isCompleted: true } : {}),
      ...(completed === "false" ? { isCompleted: false } : {})
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
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }]
  });

  return NextResponse.json({ tasks });
}
