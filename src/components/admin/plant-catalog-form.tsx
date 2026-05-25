"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PlantDifficulty, PlantStageKey } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type StageFormValue = {
  title: string;
  description: string;
  stageKey: PlantStageKey;
  dayFrom: number;
  dayTo: number;
  order: number;
};

type PlantFormValue = {
  id?: string;
  name: string;
  type: string;
  difficulty: PlantDifficulty;
  description: string;
  lightRequirement: string;
  waterRequirement: string;
  averageGerminationDays: number;
  averageHarvestDays: number;
  recommendedContainer: string;
  sowingDepth: string;
  temperature: string;
  stages: StageFormValue[];
};

type PlantCatalogFormProps = {
  mode: "create" | "edit";
  initialPlant?: PlantFormValue;
};

const difficultyOptions: Array<{ value: PlantDifficulty; label: string }> = [
  { value: "VERY_EASY", label: "очень легко" },
  { value: "EASY", label: "легко" },
  { value: "MEDIUM", label: "средне" },
  { value: "HARD", label: "сложно" }
];

const stageKeyOptions: Array<{ value: PlantStageKey; label: string }> = [
  { value: "SOWING", label: "Посев" },
  { value: "WAITING_FOR_SPROUTS", label: "Ждём всходы" },
  { value: "FIRST_LEAVES", label: "Первые листочки" },
  { value: "GROWTH", label: "Рост" },
  { value: "PINCHING", label: "Прищипка" },
  { value: "HARVEST", label: "Урожай" },
  { value: "CUSTOM", label: "Свой этап" }
];

const emptyStage: StageFormValue = {
  title: "",
  description: "",
  stageKey: "CUSTOM",
  dayFrom: 1,
  dayTo: 1,
  order: 1
};

const defaultPlant: PlantFormValue = {
  name: "",
  type: "",
  difficulty: "EASY",
  description: "",
  lightRequirement: "",
  waterRequirement: "",
  averageGerminationDays: 7,
  averageHarvestDays: 35,
  recommendedContainer: "",
  sowingDepth: "",
  temperature: "",
  stages: [{ ...emptyStage, title: "Посев", stageKey: "SOWING" }]
};

function NumberInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-700">{label}</span>
      <input
        type="number"
        min={0}
        className="mt-2 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-700">{label}</span>
      <input
        required={required}
        className="mt-2 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function PlantCatalogForm({ mode, initialPlant }: PlantCatalogFormProps) {
  const router = useRouter();
  const [plant, setPlant] = useState<PlantFormValue>(initialPlant ?? defaultPlant);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updatePlant<K extends keyof PlantFormValue>(key: K, value: PlantFormValue[K]) {
    setPlant((current) => ({ ...current, [key]: value }));
  }

  function updateStage(index: number, patch: Partial<StageFormValue>) {
    setPlant((current) => ({
      ...current,
      stages: current.stages.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, ...patch } : stage
      )
    }));
  }

  function addStage() {
    setPlant((current) => ({
      ...current,
      stages: [
        ...current.stages,
        {
          ...emptyStage,
          order: current.stages.length + 1
        }
      ]
    }));
  }

  function removeStage(index: number) {
    setPlant((current) => ({
      ...current,
      stages: current.stages
        .filter((_, stageIndex) => stageIndex !== index)
        .map((stage, stageIndex) => ({ ...stage, order: stageIndex + 1 }))
    }));
  }

  async function savePlant() {
    setError("");
    setIsLoading(true);

    const endpoint = mode === "create" ? "/api/admin/plants" : `/api/admin/plants/${plant.id}`;
    const response = await fetch(endpoint, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plant)
    });

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      plant?: { id: string };
    };

    if (!response.ok || !data.plant?.id) {
      setError(data.error ?? "Не получилось сохранить растение.");
      setIsLoading(false);
      return;
    }

    router.push("/admin/plants");
    router.refresh();
  }

  return (
    <Card className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Название" required value={plant.name} onChange={(value) => updatePlant("name", value)} />
        <TextInput label="Тип" required value={plant.type} onChange={(value) => updatePlant("type", value)} />
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Сложность</span>
          <select
            className="mt-2 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
            value={plant.difficulty}
            onChange={(event) => updatePlant("difficulty", event.target.value as PlantDifficulty)}
          >
            {difficultyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <TextInput label="Глубина посева" value={plant.sowingDepth} onChange={(value) => updatePlant("sowingDepth", value)} />
        <TextInput label="Свет" required value={plant.lightRequirement} onChange={(value) => updatePlant("lightRequirement", value)} />
        <TextInput label="Полив" required value={plant.waterRequirement} onChange={(value) => updatePlant("waterRequirement", value)} />
        <NumberInput label="Средний срок всходов, дней" value={plant.averageGerminationDays} onChange={(value) => updatePlant("averageGerminationDays", value)} />
        <NumberInput label="Средний срок урожая, дней" value={plant.averageHarvestDays} onChange={(value) => updatePlant("averageHarvestDays", value)} />
        <TextInput label="Контейнер" required value={plant.recommendedContainer} onChange={(value) => updatePlant("recommendedContainer", value)} />
        <TextInput label="Температура" value={plant.temperature} onChange={(value) => updatePlant("temperature", value)} />
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Описание</span>
        <textarea
          required
          className="mt-2 min-h-28 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
          value={plant.description}
          onChange={(event) => updatePlant("description", event.target.value)}
        />
      </label>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-leaf-700">Этапы выращивания</h3>
            <p className="mt-1 text-stone-600">Добавьте понятные шаги, которые увидит пользователь.</p>
          </div>
          <Button type="button" variant="secondary" onClick={addStage}>
            Добавить этап
          </Button>
        </div>

        {plant.stages.map((stage, index) => (
          <div key={index} className="rounded-lg border border-leaf-100 bg-leaf-50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Название этапа" required value={stage.title} onChange={(value) => updateStage(index, { title: value })} />
              <label className="block">
                <span className="text-sm font-semibold text-stone-700">Тип этапа</span>
                <select
                  className="mt-2 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
                  value={stage.stageKey}
                  onChange={(event) => updateStage(index, { stageKey: event.target.value as PlantStageKey })}
                >
                  {stageKeyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <NumberInput label="День с" value={stage.dayFrom} onChange={(value) => updateStage(index, { dayFrom: value })} />
              <NumberInput label="День по" value={stage.dayTo} onChange={(value) => updateStage(index, { dayTo: value })} />
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-semibold text-stone-700">Описание этапа</span>
              <textarea
                required
                className="mt-2 min-h-24 w-full rounded-md border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-2 focus:ring-leaf-100"
                value={stage.description}
                onChange={(event) => updateStage(index, { description: event.target.value })}
              />
            </label>
            <div className="mt-4 flex justify-between">
              <span className="text-sm font-semibold text-stone-500">Порядок: {index + 1}</span>
              <button
                type="button"
                className="font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={plant.stages.length === 1}
                onClick={() => removeStage(index)}
              >
                Удалить этап
              </button>
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="secondary" href="/admin/plants" disabled={isLoading}>
          Назад
        </Button>
        <Button type="button" onClick={savePlant} disabled={isLoading}>
          {isLoading ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </Card>
  );
}
