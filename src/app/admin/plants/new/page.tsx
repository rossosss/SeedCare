import { PlantCatalogForm } from "@/components/admin/plant-catalog-form";

export default function NewAdminPlantPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-stone-900">Новое растение</h2>
        <p className="mt-2 text-stone-600">Заполните карточку каталога и этапы выращивания.</p>
      </div>
      <PlantCatalogForm mode="create" />
    </div>
  );
}
