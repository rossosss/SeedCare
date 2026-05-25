import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { aiAdviceSchema, getValidationError, parseJson } from "@/lib/validation";
import { generatePlantAdvice } from "@/server/services/ai.service";
import { canUseAi } from "@/server/services/subscription.service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  const rate = rateLimit({
    key: getRateLimitKey(request, "ai", user.id),
    limit: 20,
    windowMs: 60 * 60 * 1000
  });

  if (!rate.ok) {
    return NextResponse.json({ error: "Слишком много запросов к помощнику. Попробуйте позже." }, { status: 429 });
  }

  const parsed = aiAdviceSchema.safeParse(await parseJson(request));

  if (!parsed.success) {
    return NextResponse.json({ error: getValidationError(parsed.error) }, { status: 400 });
  }

  const aiAccess = await canUseAi(user.id);

  if (!aiAccess.ok) {
    return NextResponse.json(
      {
        error: aiAccess.reason,
        code: "AI_LIMIT_REACHED",
        paywall: aiAccess.reason,
        plan: aiAccess.plan,
        limit: aiAccess.limit,
        used: aiAccess.used
      },
      { status: 402 }
    );
  }

  const userPlant = await prisma.userPlant.findFirst({
    where: { id: parsed.data.userPlantId, userId: user.id },
    include: {
      plantCatalog: { include: { stages: { orderBy: { order: "asc" } } } },
      careTasks: { orderBy: { dueDate: "asc" }, take: 12 },
      diaryEntries: { orderBy: { createdAt: "desc" }, take: 8 }
    }
  });

  if (!userPlant) {
    return NextResponse.json({ error: "Растение не найдено." }, { status: 404 });
  }

  try {
    const answer = await generatePlantAdvice({
      question: parsed.data.question,
      userPlant,
      plantCatalog: userPlant.plantCatalog,
      careTasks: userPlant.careTasks,
      diaryEntries: userPlant.diaryEntries
    });

    await prisma.aiUsageLog.create({ data: { userId: user.id } });

    return NextResponse.json({
      answer,
      remainingRequests: aiAccess.remaining === null ? null : Math.max(0, aiAccess.remaining - 1)
    });
  } catch (error) {
    console.error("SeedCare AI error", error);
    return NextResponse.json(
      { error: "Помощник временно не ответил. Попробуйте ещё раз чуть позже." },
      { status: 502 }
    );
  }
}
