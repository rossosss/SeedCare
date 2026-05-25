"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не получилось войти. Проверьте email и пароль.");
      setIsLoading(false);
      return;
    }

    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          autoComplete="current-password"
          required
        />
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
        {isLoading ? "Входим..." : "Войти"}
      </button>
    </form>
  );
}
