import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
};

export function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerHref,
  footerLinkText
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-leaf-100 bg-white p-6 shadow-sm shadow-leaf-100/40">
        <Link href="/" className="rounded-lg text-sm font-semibold text-leaf-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100">
          SeedCare
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-leaf-700">{title}</h1>
        <p className="mt-2 text-base text-stone-600">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-center text-sm text-stone-600">
          {footerText}{" "}
          <Link href={footerHref} className="rounded-lg font-semibold text-leaf-700 hover:text-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100">
            {footerLinkText}
          </Link>
        </p>
      </section>
    </main>
  );
}
