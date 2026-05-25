"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { PlantCatalogCardData } from "@/components/plants/plant-catalog-card";

type NewPlantWizardProps = {
  catalogPlants: PlantCatalogCardData[];
  initialPlantId?: string;
};

type Option = { value: string; label: string; description: string };

const placeOptions: Option[] = [
  { value: "WINDOWSILL", label: "Подоконник", description: "Хорошо для зелени и рассады." },
  { value: "BALCONY", label: "Балкон", description: "Подойдёт, если там тепло и светло." },
  { value: "GROW_LIGHT_SHELF", label: "Стеллаж с лампой", description: "Удобно для стабильного света." },
  { value: "UNKNOWN", label: "Пока не знаю", description: "Можно решить позже." }
];

const lightOptions: Option[] = [
  { value: "FULL_DAY", label: "Много, весь день", description: "Для светолюбивых растений." },
  { value: "FEW_HOURS", label: "Несколько часов", description: "Подходит многим видам зелени." },
  { value: "LOW_LIGHT", label: "Мало света", description: "Лучше выбрать неприхотливое растение или лампу." },
  { value: "UNKNOWN", label: "Не знаю", description: "SeedCare будет давать осторожные советы." }
];

const containerOptions: Option[] = [
  { value: "SMALL_POT", label: "Маленький горшок", description: "Хороший старт для зелени." },
  { value: "LONG_BOX", label: "Длинный ящик", description: "Удобно для подоконника." },
  { value: "CONTAINER", label: "Контейнер", description: "Подойдёт для микрозелени и рассады." },
  { value: "NOT_READY", label: "Пока ничего нет", description: "Сначала подготовим простые вещи." }
];

function OptionGrid({ options, value, onChange }: { options: Option[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 ${
            value === option.value ? "border-leaf-700 bg-leaf-50" : "border-leaf-100 bg-white hover:border-leaf-500"
          }`}
        >
          <span className="text-lg font-bold text-leaf-700">{option.label}</span>
          <span className="mt-2 block text-sm leading-6 text-stone-600">{option.description}</span>
        </button>
      ))}
    </div>
  );
}

export function NewPlantWizard({ catalogPlants, initialPlantId }: NewPlantWizardProps) {
  const router = useRouter();
  const initialPlant = catalogPlants.find((plant) => plant.id === initialPlantId);
  const [step, setStep] = useState(initialPlant ? 2 : 1);
  const [query, setQuery] = useState("");
  const [selectedPlantId, setSelectedPlantId] = useState(initialPlant?.id ?? "");
  const [place, setPlace] = useState("WINDOWSILL");
  const [lightCondition, setLightCondition] = useState("FEW_HOURS");
  const [containerType, setContainerType] = useState("SMALL_POT");
  const [customName, setCustomName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedPlant = catalogPlants.find((plant) => plant.id === selectedPlantId);
  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return catalogPlants;
    return catalogPlants.filter((plant) => [plant.name, plant.type, plant.description].join(" ").toLowerCase().includes(normalizedQuery));
  }, [catalogPlants, query]);

  function goNext() {
    setError("");
    if (step === 1 && !selectedPlantId) {
      setError("Выберите растение из каталога.");
      return;
    }
    setStep((current) => Math.min(5, current + 1));
  }

  async function createPlant() {
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/user-plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantCatalogId: selectedPlantId, customName, place, lightCondition, containerType, notes })
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; userPlant?: { id: string } };

    if (!response.ok || !data.userPlant?.id) {
      setError(data.error ?? "Не получилось создать растение. Попробуйте ещё раз.");
      setIsLoading(false);
      return;
    }

    router.push(`/plants/${data.userPlant.id}`);
    router.refresh();
  }

  return (
    <Card className="space-y-6">
      <div className="grid grid-cols-5 gap-2" aria-label="Прогресс мастера">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className={`h-2 rounded-full ${item <= step ? "bg-leaf-700" : "bg-leaf-100"}`} />
        ))}
      </div>

      <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">Шаг {step} из 5</p>

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-leaf-700">Выберите растение</h2>
            <p className="mt-2 text-stone-600">Найдите семена, которые хотите посадить.</p>
          </div>
          <label className="block">
            <span className="text-sm font-semibold text-stone-700">Поиск</span>
            <input className="mt-2 w-full rounded-xl border border-leaf-100 px-4 py-3 outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" type="search" placeholder="Например, базилик" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {catalogPlants.length === 0 ? (
            <EmptyState title="Каталог пока пуст." description="Запустите seed script или добавьте растение в админке." />
          ) : filteredPlants.length === 0 ? (
            <EmptyState title="Ничего не найдено." description="Попробуйте другое название." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredPlants.map((plant) => (
                <button key={plant.id} type="button" className={`rounded-2xl border p-4 text-left ${plant.id === selectedPlantId ? "border-leaf-700 bg-leaf-50" : "border-leaf-100 bg-white hover:border-leaf-500"}`} onClick={() => setSelectedPlantId(plant.id)}>
                  <span className="text-lg font-bold text-leaf-700">{plant.name}</span>
                  <span className="mt-1 block text-sm text-stone-600">{plant.type}</span>
                  <span className="mt-3 block text-sm leading-6 text-stone-600">{plant.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === 2 ? <div className="space-y-5"><h2 className="text-2xl font-bold text-leaf-700">Где будет расти?</h2><OptionGrid options={placeOptions} value={place} onChange={setPlace} /></div> : null}
      {step === 3 ? <div className="space-y-5"><h2 className="text-2xl font-bold text-leaf-700">Сколько света?</h2><OptionGrid options={lightOptions} value={lightCondition} onChange={setLightCondition} /></div> : null}
      {step === 4 ? (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-leaf-700">Во что посадим?</h2>
          <OptionGrid options={containerOptions} value={containerType} onChange={setContainerType} />
          {containerType === "NOT_READY" ? <div className="rounded-2xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-900">Для старта подойдёт горшок с отверстиями, универсальный грунт и пульверизатор.</div> : null}
        </div>
      ) : null}
      {step === 5 ? (
        <div className="space-y-5">
          <h2 className="text-2xl font-bold text-leaf-700">Проверьте план</h2>
          <div className="rounded-2xl border border-leaf-100 bg-leaf-50 p-5">
            <h3 className="text-xl font-bold text-leaf-700">{selectedPlant?.name}</h3>
            <p className="mt-2 text-stone-600">SeedCare создаст карточку растения и первые задачи ухода.</p>
          </div>
          <label className="block"><span className="text-sm font-semibold text-stone-700">Своё название</span><input className="mt-2 w-full rounded-xl border border-leaf-100 px-4 py-3 outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" placeholder="Например, базилик на кухне" value={customName} onChange={(event) => setCustomName(event.target.value)} /></label>
          <label className="block"><span className="text-sm font-semibold text-stone-700">Заметка</span><textarea className="mt-2 min-h-24 w-full rounded-xl border border-leaf-100 px-4 py-3 outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100" placeholder="Например, посеял в готовый грунт" value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
        </div>
      ) : null}

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="secondary" disabled={step === 1 || isLoading} onClick={() => setStep((current) => Math.max(1, current - 1))}>Назад</Button>
        {step < 5 ? <Button type="button" onClick={goNext} disabled={catalogPlants.length === 0}>Дальше</Button> : <Button type="button" onClick={createPlant} disabled={isLoading || !selectedPlantId}>{isLoading ? "Создаём план..." : "Создать мой план"}</Button>}
      </div>
    </Card>
  );
}
