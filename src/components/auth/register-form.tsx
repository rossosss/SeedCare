"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не получилось создать аккаунт. Попробуйте ещё раз.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Имя</span>
        <input
          className="mt-2 w-full rounded-xl border border-leaf-100 px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100"
          name="name"
          type="text"
          autoComplete="name"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Email</span>
        <input
          className="mt-2 w-full rounded-xl border border-leaf-100 px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-stone-700">Пароль</span>
        <input
          className="mt-2 w-full rounded-xl border border-leaf-100 px-4 py-3 text-base outline-none focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <span className="mt-2 block text-sm text-stone-500">Минимум 8 символов.</span>
      </label>
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        className="w-full rounded-xl bg-leaf-700 px-5 py-3 text-base font-semibold text-white transition hover:bg-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Создаём аккаунт..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}
