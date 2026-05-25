import type { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  canCreatePlantForUsage,
  getPlanLimits,
  getRemainingAiRequests,
  hasFeature,
  type PlanFeature
} from "@/lib/plan-limits";

export class PlanLimitError extends Error {
  code: string;
  paywall: string;
  plan: SubscriptionPlan;

  constructor(message: string, code: string, plan: SubscriptionPlan) {
    super(message);
    this.name = "PlanLimitError";
    this.code = code;
    this.paywall = message;
    this.plan = plan;
  }
}

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true }
  });

  if (!subscription) return "FREE";
  if (subscription.status === "ACTIVE" || subscription.status === "TRIALING") return subscription.plan;
  return "FREE";
}

export async function canCreatePlant(userId: string) {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.plantLimit === null) {
    return { ok: true as const, plan, limit: null, used: 0 };
  }

  const used = await prisma.userPlant.count({
    where: { userId, status: { not: "ARCHIVED" } }
  });

  if (!canCreatePlantForUsage(plan, used)) {
    return {
      ok: false as const,
      plan,
      limit: limits.plantLimit,
      used,
      reason: "Вы вырастили уже 5 растений. Чтобы добавить больше и получить умные подсказки, перейдите на Plus."
    };
  }

  return { ok: true as const, plan, limit: limits.plantLimit, used };
}

export async function canUseAi(userId: string) {
  const plan = await getUserPlan(userId);
  const limits = getPlanLimits(plan);

  if (limits.monthlyAiRequests === null) {
    return { ok: true as const, plan, limit: null, used: 0, remaining: null };
  }

  const { start, end } = getMonthRange();
  const used = await prisma.aiUsageLog.count({
    where: { userId, createdAt: { gte: start, lt: end } }
  });
  const remaining = getRemainingAiRequests(plan, used);

  if (remaining === 0) {
    return {
      ok: false as const,
      plan,
      limit: limits.monthlyAiRequests,
      used,
      remaining,
      reason: "Лимит AI-помощника на этом тарифе закончился. Перейдите на Plus, чтобы задавать больше вопросов."
    };
  }

  return { ok: true as const, plan, limit: limits.monthlyAiRequests, used, remaining };
}

export async function assertFeatureAccess(userId: string, feature: PlanFeature) {
  const plan = await getUserPlan(userId);

  if (hasFeature(plan, feature)) return { plan };

  throw new PlanLimitError(
    "Эта возможность доступна на Plus. Перейдите на Plus, чтобы открыть больше подсказок и удобных функций.",
    "FEATURE_REQUIRES_PLUS",
    plan
  );
}
