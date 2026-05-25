"use client";

import { FormEvent, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";

export type DiaryEntry = {
  id: string;
  note: string;
  imageUrl: string | null;
  createdAt: string | Date;
};

type PlantDiaryProps = {
  plantId: string;
  initialEntries: DiaryEntry[];
};

const quickNotes = [
  "Полил",
  "Появились всходы",
  "Переставил к свету",
  "Земля влажная"
];

function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function PlantDiary({ plantId, initialEntries }: PlantDiaryProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);

  async function createEntry(nextNote: string, label = "note") {
    const trimmedNote = nextNote.trim();

    if (!trimmedNote) {
      setError("Напишите заметку или выберите быструю кнопку.");
      return;
    }

    setError("");
    setLoadingLabel(label);

    const response = await fetch(`/api/user-plants/${plantId}/diary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        note: trimmedNote,
        imageUrl: null
      })
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      entry?: DiaryEntry;
    };

    if (!response.ok || !data.entry) {
      setError(data.error ?? "Не получилось добавить заметку. Попробуйте ещё раз.");
      setLoadingLabel(null);
      return;
    }

    setEntries((current) => [data.entry as DiaryEntry, ...current]);
    setNote("");
    setLoadingLabel(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createEntry(note);
  }

  async function deleteEntry(entryId: string) {
    setError("");
    setLoadingLabel(entryId);

    const response = await fetch(`/api/diary/${entryId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      setError("Не получилось удалить запись. Попробуйте ещё раз.");
      setLoadingLabel(null);
      return;
    }

    setEntries((current) => current.filter((entry) => entry.id !== entryId));
    setLoadingLabel(null);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Новая заметка</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
            placeholder="Например: появились первые ростки"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loadingLabel !== null}
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-leaf-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-leaf-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingLabel === "note" ? "Добавляем..." : "Добавить заметку"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {quickNotes.map((quickNote) => (
          <button
            key={quickNote}
            type="button"
            disabled={loadingLabel !== null}
            className="rounded-md bg-leaf-50 px-4 py-2 text-sm font-semibold text-leaf-700 ring-1 ring-leaf-100 transition hover:ring-leaf-500 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => createEntry(quickNote, quickNote)}
          >
            {loadingLabel === quickNote ? "Сохраняем..." : quickNote}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          title="Здесь появится история растения."
          description="Можно записывать важные моменты: всходы, полив, пересадку и первые листья."
        />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-leaf-100 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm leading-6 text-stone-700">{entry.note}</p>
                  <p className="mt-2 text-xs font-semibold text-stone-500">
                    {formatDateTime(entry.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loadingLabel === entry.id}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-100 transition hover:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => deleteEntry(entry.id)}
                >
                  {loadingLabel === entry.id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
