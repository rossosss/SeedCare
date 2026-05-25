"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Главная" },
  { href: "/plants", label: "Мои растения" },
  { href: "/calendar", label: "Календарь" },
  { href: "/profile", label: "Профиль" }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Основная навигация">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100 ${
              isActive
                ? "bg-leaf-700 text-white shadow-sm"
                : "bg-white text-stone-700 ring-1 ring-leaf-100 hover:bg-leaf-50 hover:text-leaf-700"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
