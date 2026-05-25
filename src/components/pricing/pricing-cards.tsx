"use client";

import { useState } from "react";
import type { SubscriptionPlan } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PricingCardsProps = {
  currentPlan: SubscriptionPlan;
};

const plans: Array<{
  plan: SubscriptionPlan;
  name: string;
  price: string;
  description: string;
  features: string[];
}> = [
  {
    plan: "FREE",
    name: "Free",
    price: "0 ₽",
    description: "Для первых посадок и знакомства с приложением.",
    features: ["До 5 растений", "До 3 AI-запросов в месяц", "Базовые задачи ухода", "Простой календарь"]
  },
  {
    plan: "PLUS",
    name: "Plus",
    price: "позже",
    description: "Для домашней фермы, балкона и регулярного ухода.",
    features: ["До 50 растений", "До 100 AI-запросов в месяц", "Умные задачи", "Погодные предупреждения", "Дневник растения"]
  },
  {
    plan: "PRO",
    name: "Pro",
    price: "позже",
    description: "Для большой коллекции и будущей аналитики.",
    features: ["Безлимит растений", "Больше AI-запросов", "Расширенная аналитика", "Семейный доступ в будущем"]
  }
];

export function PricingCards({ currentPlan }: PricingCardsProps) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-5">
      {message ? (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-base font-semibold text-yellow-900">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.plan === currentPlan;

          return (
            <Card key={plan.plan} className={`flex h-full flex-col gap-5 ${isCurrent ? "border-leaf-500 ring-2 ring-leaf-100" : ""}`}>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Тариф</p>
                <h2 className="mt-2 text-3xl font-bold text-leaf-700">{plan.name}</h2>
                <p className="mt-2 text-2xl font-bold text-stone-900">{plan.price}</p>
                <p className="mt-3 text-base leading-7 text-stone-600">{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-3 text-base leading-7 text-stone-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-leaf-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button type="button" variant="secondary" disabled>
                  Текущий тариф
                </Button>
              ) : (
                <Button type="button" onClick={() => setMessage("Оплата будет подключена позже.")}>
                  Перейти на {plan.name}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
