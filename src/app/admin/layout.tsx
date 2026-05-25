import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/current-user";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-cream px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-lg border border-leaf-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                SeedCare
              </p>
              <h1 className="text-2xl font-bold text-leaf-700">Админка каталога</h1>
            </div>
            <nav className="flex flex-wrap gap-2">
              <Link className="rounded-md px-4 py-2 font-semibold text-leaf-700 hover:bg-leaf-50" href="/admin">
                Обзор
              </Link>
              <Link className="rounded-md px-4 py-2 font-semibold text-leaf-700 hover:bg-leaf-50" href="/admin/plants">
                Растения
              </Link>
              <Link className="rounded-md bg-leaf-700 px-4 py-2 font-semibold text-white hover:bg-leaf-500" href="/admin/plants/new">
                Добавить растение
              </Link>
              <Link className="rounded-md px-4 py-2 font-semibold text-leaf-700 hover:bg-leaf-50" href="/dashboard">
                В приложение
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
