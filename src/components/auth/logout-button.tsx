"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type LogoutButtonProps = {
  compact?: boolean;
};

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      className={`rounded-md border border-leaf-100 bg-white font-semibold text-leaf-700 transition hover:border-leaf-500 disabled:cursor-not-allowed disabled:opacity-60 ${
        compact ? "min-h-10 px-4 py-2 text-sm" : "px-5 py-3 text-base"
      }`}
      type="button"
      disabled={isLoading}
      onClick={handleLogout}
    >
      {isLoading ? "Выходим..." : "Выйти"}
    </button>
  );
}
