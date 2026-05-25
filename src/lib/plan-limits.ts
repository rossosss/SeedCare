import type { SubscriptionPlan } from "@prisma/client";

export type PlanFeature =
  | "BASIC_TASKS"
  | "SMART_TASKS"
  | "WEATHER_WARNINGS"
  | "DIARY"
  | "ADVANCED_WEATHER"
  | "ANALYTICS"
  | "FAMILY_ACCESS";

export type PlanLimits = {
  plantLimit: number | null;
  monthlyAiRequests: number | null;
  features: PlanFeature[];
};

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    plantLimit: 5,
    monthlyAiRequests: 3,
    features: ["BASIC_TASKS"]
  },
  PLUS: {
    plantLimit: 50,
    monthlyAiRequests: 100,
    features: ["BASIC_TASKS", "SMART_TASKS", "WEATHER_WARNINGS", "DIARY"]
  },
  PRO: {
    plantLimit: null,
    monthlyAiRequests: null,
    features: [
      "BASIC_TASKS",
      "SMART_TASKS",
      "WEATHER_WARNINGS",
      "DIARY",
      "ADVANCED_WEATHER",
      "ANALYTICS",
      "FAMILY_ACCESS"
    ]
  }
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Free",
  PLUS: "Plus",
  PRO: "Pro"
};

export function getPlanLimits(plan: SubscriptionPlan) {
  return PLAN_LIMITS[plan];
}

export function hasFeature(plan: SubscriptionPlan, feature: PlanFeature) {
  return PLAN_LIMITS[plan].features.includes(feature);
}

export function canCreatePlantForUsage(plan: SubscriptionPlan, usedPlants: number) {
  const limit = PLAN_LIMITS[plan].plantLimit;
  return limit === null || usedPlants < limit;
}

export function getRemainingAiRequests(plan: SubscriptionPlan, usedRequests: number) {
  const limit = PLAN_LIMITS[plan].monthlyAiRequests;

  if (limit === null) {
    return null;
  }

  return Math.max(0, limit - usedRequests);
}
