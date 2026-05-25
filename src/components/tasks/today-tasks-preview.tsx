import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type TaskPreview = {
  id: string;
  title: string;
  description: string;
};

type TodayTasksPreviewProps = {
  tasks: TaskPreview[];
};

export function TodayTasksPreview({ tasks }: TodayTasksPreviewProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-leaf-700">Сегодня нужно сделать</h2>
      <p className="mt-2 text-base leading-7 text-stone-600">
        Самые важные дела по уходу на сегодня.
      </p>
      <div className="mt-5">
        {tasks.length === 0 ? (
          <EmptyState
            title="Сегодня задач нет."
            description="Можно спокойно наблюдать за растениями или добавить первое растение."
          />
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="rounded-2xl bg-leaf-50 p-4">
                <p className="font-bold text-leaf-700">{task.title}</p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{task.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
