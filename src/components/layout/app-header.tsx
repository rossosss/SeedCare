import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { AppNav } from "@/components/layout/app-nav";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-leaf-100 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl text-xl font-bold text-leaf-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
          >
            SeedCare
          </Link>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <div className="hidden sm:block">
              <Button href="/plants/new" className="min-h-11 px-4 py-2 text-sm">
                Посадить новое
              </Button>
            </div>
            <div className="hidden sm:block">
              <LogoutButton compact />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <AppNav />
          <div className="grid grid-cols-[1fr_auto] gap-2 sm:hidden">
            <Button href="/plants/new" className="min-h-11 px-4 py-2 text-sm">
              Посадить новое
            </Button>
            <LogoutButton compact />
          </div>
        </div>
      </div>
    </header>
  );
}
