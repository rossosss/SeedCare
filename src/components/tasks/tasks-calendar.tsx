"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export type CalendarTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string | Date;
  isCompleted: boolean;
  taskType: string;
  userPlant: {
    id: string;
    customName: string | null;
    plantCatalog: { name: string };
  };
};

type TasksCalendarProps = {
  initialTasks: CalendarTask[];
};

type Filter = "all" | "active" | "completed";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDayLabel(date: Date) {
  const today = startOfToday();
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Завтра";
  if (diffDays === 2) return "Через 2 дня";

  return target.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "long"
  });
}

function getPlantName(task: CalendarTask) {
  return task.userPlant.customName || task.userPlant.plantCatalog.name;
}

export function TasksCalendar({ initialTasks }: TasksCalendarProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<Filter>("active");
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "active") return !task.isCompleted;
      if (filter === "completed") return task.isCompleted;
      return true;
    });
  }, [filter, tasks]);

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, CalendarTask[]>();

    for (const task of filteredTasks) {
      const date = new Date(task.dueDate);
      const key = formatDateKey(date);
      groups.set(key, [...(groups.get(key) ?? []), task]);
    }

    return Array.from(groups.entries()).sort(([first], [second]) => first.localeCompare(second));
  }, [filteredTasks]);

  async function completeTask(taskId: string) {
    setError("");
    setLoadingTaskId(taskId);

    const response = await fetch(`/api/tasks/${taskId}/complete`, { method: "PATCH" });

    if (!response.ok) {
      setError("Не получилось отметить задачу. Попробуйте ещё раз.");
      setLoadingTaskId(null);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, isCompleted: true } : task))
    );
    setLoadingTaskId(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "Все" },
          { value: "active", label: "Активные" },
          { value: "completed", label: "Выполненные" }
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 ${
              filter === item.value
                ? "bg-leaf-700 text-white"
                : "bg-white text-leaf-700 ring-1 ring-leaf-100 hover:ring-leaf-500"
            }`}
            onClick={() => setFilter(item.value as Filter)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {groupedTasks.length === 0 ? (
        <EmptyState
          title="На эти дни задач нет."
          description="Можно спокойно наблюдать за растениями."
        />
      ) : (
        <div className="space-y-5">
          {groupedTasks.map(([dateKey, dayTasks]) => (
            <section key={dateKey} className="rounded-2xl border border-leaf-100 bg-white p-5 shadow-sm">
              <h2 className="text-2xl font-bold text-leaf-700">
                {getDayLabel(new Date(dayTasks[0].dueDate))}
              </h2>
              <ul className="mt-4 space-y-3">
                {dayTasks.map((task) => {
                  const plantName = getPlantName(task);

                  return (
                    <li
                      key={task.id}
                      className={`rounded-2xl p-4 transition ${
                        task.isCompleted ? "bg-stone-50 text-stone-500" : "bg-leaf-50"
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-bold ${task.isCompleted ? "line-through" : "text-leaf-700"}`}>
                              {task.title} у {plantName}
                            </p>
                            {task.isCompleted ? <Badge tone="neutral">Выполнено</Badge> : null}
                          </div>
                          <p className="mt-1 text-sm leading-6 text-stone-600">{task.description}</p>
                          <Link
                            href={`/plants/${task.userPlant.id}`}
                            className="mt-2 inline-flex rounded-lg text-sm font-semibold text-leaf-700 hover:text-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
                          >
                            Открыть растение
                          </Link>
                        </div>
                        {!task.isCompleted ? (
                          <button
                            type="button"
                            disabled={loadingTaskId === task.id}
                            onClick={() => completeTask(task.id)}
                            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-leaf-700 ring-1 ring-leaf-100 transition hover:ring-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {loadingTaskId === task.id ? "Отмечаем..." : "Готово"}
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
