import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type Reminder = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
};

type ImportantRemindersProps = {
  reminders: Reminder[];
};

export function ImportantReminders({ reminders }: ImportantRemindersProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-leaf-700">Важные напоминания</h2>
      {reminders.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Важных напоминаний нет."
            description="Если появятся задачи, погодные риски или новые этапы, мы покажем их здесь."
          />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {reminders.map((reminder) => (
            <li
              key={reminder.id}
              className={`rounded-lg p-4 ${reminder.isRead ? "bg-stone-50" : "bg-leaf-50"}`}
            >
              <p className="font-bold text-leaf-700">{reminder.title}</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">{reminder.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
