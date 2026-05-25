"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type PlantQuickActionsProps = {
  plantId: string;
};

export function PlantQuickActions({ plantId }: PlantQuickActionsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function runAction(action: string, note?: string) {
    setError("");
    setLoadingAction(action);

    const response = await fetch(`/api/user-plants/${plantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не получилось выполнить действие. Попробуйте ещё раз.");
      setLoadingAction(null);
      return;
    }

    setLoadingAction(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => runAction("WATERED")}
          className="w-full"
        >
          {loadingAction === "WATERED" ? "Сохраняем..." : "Я полил"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loadingAction !== null}
          onClick={() => runAction("SOIL_STILL_WET")}
          className="w-full"
        >
          Земля ещё влажная
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loadingAction !== null}
          onClick={() => runAction("SPROUTED")}
          className="w-full"
        >
          Появились всходы
        </Button>
      </div>
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
