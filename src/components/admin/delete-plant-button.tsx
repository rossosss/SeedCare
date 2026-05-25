"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePlantButton({ plantId }: { plantId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function deletePlant() {
    const confirmed = window.confirm("Удалить растение из каталога? Если оно уже используется, удаление будет запрещено.");

    if (!confirmed) {
      return;
    }

    setError("");
    setIsLoading(true);

    const response = await fetch(`/api/admin/plants/${plantId}`, {
      method: "DELETE"
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не получилось удалить растение.");
      setIsLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        disabled={isLoading}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={deletePlant}
      >
        {isLoading ? "Удаляем..." : "Удалить"}
      </button>
      {error ? <p className="mt-2 max-w-xs text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
