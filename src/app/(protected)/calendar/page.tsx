import { PageHeader } from "@/components/layout/page-header";
import { TasksCalendar } from "@/components/tasks/tasks-calendar";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default async function CalendarPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = addDays(from, 14);
  to.setHours(23, 59, 59, 999);

  const tasks = await prisma.careTask.findMany({
    where: {
      userPlant: { userId: user.id },
      dueDate: { gte: from, lte: to }
    },
    include: {
      userPlant: {
        select: {
          id: true,
          customName: true,
          plantCatalog: { select: { name: true } }
        }
      }
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }]
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Календарь"
        description="Задачи на сегодня, завтра и ближайшие дни. Выполненное можно отметить сразу здесь."
      />
      <TasksCalendar
        initialTasks={tasks.map((task) => ({
          ...task,
          dueDate: task.dueDate.toISOString()
        }))}
      />
    </div>
  );
}
