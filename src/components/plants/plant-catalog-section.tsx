"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { PlantCatalogCard, type PlantCatalogCardData } from "@/components/plants/plant-catalog-card";

type PlantCatalogSectionProps = {
  plants: PlantCatalogCardData[];
};

export function PlantCatalogSection({ plants }: PlantCatalogSectionProps) {
  const [query, setQuery] = useState("");

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return plants;
    }

    return plants.filter((plant) =>
      [
        plant.name,
        plant.type,
        plant.description,
        plant.lightRequirement,
        plant.waterRequirement,
        plant.recommendedContainer
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [plants, query]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-leaf-700">Каталог растений</h2>
          <p className="mt-2 text-base leading-7 text-stone-600">
            Найдите семена, которые хотите посадить дома.
          </p>
        </div>
        <label className="w-full md:max-w-sm">
          <span className="text-sm font-semibold text-stone-700">Поиск по каталогу</span>
          <input
            className="mt-2 w-full rounded-xl border border-leaf-100 bg-white px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100"
            type="search"
            placeholder="Например, базилик"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {plants.length === 0 ? (
        <EmptyState title="Каталог пока пуст." description="Запустите seed script или добавьте растение в админке." />
      ) : filteredPlants.length === 0 ? (
        <EmptyState
          title="Ничего не найдено."
          description="Попробуйте другое название: томат, базилик, зелень или микрозелень."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredPlants.map((plant) => (
            <PlantCatalogCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </section>
  );
}
