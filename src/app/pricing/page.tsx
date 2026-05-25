import Link from "next/link";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { getCurrentUser } from "@/lib/current-user";
import { getUserPlan } from "@/server/services/subscription.service";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const currentPlan = user ? await getUserPlan(user.id) : "FREE";

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={user ? "/dashboard" : "/"} className="rounded-lg text-sm font-semibold text-leaf-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100">
              SeedCare / Домашняя ферма
            </Link>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900">
              Тарифы без лишней сложности
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
              Начните бесплатно. Когда растений станет больше, можно будет открыть больше подсказок,
              погодные предупреждения и дополнительные вопросы помощнику.
            </p>
          </div>
          <Link
            href={user ? "/plants/new" : "/auth/register"}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-leaf-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
          >
            {user ? "Посадить новое" : "Начать бесплатно"}
          </Link>
        </header>

        <PricingCards currentPlan={currentPlan} />
      </div>
    </main>
  );
}
