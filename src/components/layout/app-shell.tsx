import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-9">{children}</main>
    </div>
  );
}
