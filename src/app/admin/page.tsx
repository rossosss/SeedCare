import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminPage() {
  const [plantsCount, stagesCount, usersCount] = await Promise.all([
    prisma.plantCatalog.count(),
    prisma.plantStage.count(),
    prisma.user.count()
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Каталог</p>
        <p className="mt-2 text-4xl font-bold text-leaf-700">{plantsCount}</p>
        <p className="mt-2 text-stone-600">растений в справочнике</p>
      </Card>
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Этапы</p>
        <p className="mt-2 text-4xl font-bold text-leaf-700">{stagesCount}</p>
        <p className="mt-2 text-stone-600">шагов выращивания</p>
      </Card>
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Пользователи</p>
        <p className="mt-2 text-4xl font-bold text-leaf-700">{usersCount}</p>
        <p className="mt-2 text-stone-600">аккаунтов в системе</p>
      </Card>
      <Card className="md:col-span-3">
        <h2 className="text-2xl font-bold text-leaf-700">Управление растениями</h2>
        <p className="mt-2 max-w-2xl text-stone-600">
          Здесь можно добавлять культуры, редактировать описание и настраивать этапы выращивания.
        </p>
        <Link
          href="/admin/plants"
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-leaf-700 px-5 py-3 font-semibold text-white hover:bg-leaf-500"
        >
          Открыть каталог
        </Link>
      </Card>
    </div>
  );
}
