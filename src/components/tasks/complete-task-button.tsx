"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompleteTaskButtonProps = {
  taskId: string;
};

export function CompleteTaskButton({ taskId }: CompleteTaskButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function completeTask() {
    setIsLoading(true);
    await fetch(`/api/tasks/${taskId}/complete`, { method: "PATCH" });
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={completeTask}
      className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-leaf-700 ring-1 ring-leaf-100 transition hover:ring-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Отмечаем..." : "Готово"}
    </button>
  );
}
