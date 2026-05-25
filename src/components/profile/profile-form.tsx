"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    city?: string | null;
    country?: string | null;
    careMode?: "SIMPLE" | "EXPERT";
  };
};

const inputClass =
  "mt-2 w-full rounded-xl border border-leaf-100 px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100";

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        city: formData.get("city"),
        country: formData.get("country"),
        careMode: formData.get("careMode")
      })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не получилось сохранить профиль.");
      setIsLoading(false);
      return;
    }

    setSuccess("Готово. Профиль сохранён.");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Имя</span>
          <input name="name" defaultValue={user.name} required className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Email</span>
          <input
            value={user.email}
            readOnly
            className="mt-2 w-full rounded-xl border border-leaf-100 bg-stone-50 px-4 py-3 text-base text-stone-600"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Город</span>
          <input name="city" defaultValue={user.city ?? ""} placeholder="Например, Москва" className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-stone-700">Страна</span>
          <input name="country" defaultValue={user.country ?? ""} placeholder="Например, Россия" className={inputClass} />
        </label>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-stone-700">Режим ухода</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="rounded-2xl border border-leaf-100 bg-leaf-50 p-4">
            <input type="radio" name="careMode" value="SIMPLE" defaultChecked={(user.careMode ?? "SIMPLE") === "SIMPLE"} className="mr-2" />
            <span className="font-semibold text-leaf-700">Простой режим</span>
            <p className="mt-1 text-sm leading-6 text-stone-600">Короткие советы без лишних деталей.</p>
          </label>
          <label className="rounded-2xl border border-leaf-100 bg-leaf-50 p-4">
            <input type="radio" name="careMode" value="EXPERT" defaultChecked={user.careMode === "EXPERT"} className="mr-2" />
            <span className="font-semibold text-leaf-700">Опытный режим</span>
            <p className="mt-1 text-sm leading-6 text-stone-600">Больше деталей про этапы, свет и риски.</p>
          </label>
        </div>
      </fieldset>

      {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="rounded-xl border border-leaf-100 bg-leaf-50 px-4 py-3 text-sm text-leaf-700">{success}</p> : null}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Сохраняем..." : "Сохранить профиль"}
      </Button>
    </form>
  );
}
