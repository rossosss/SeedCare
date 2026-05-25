import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      <section className="mx-auto grid min-h-screen max-w-6xl content-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-leaf-700">
            SeedCare / Домашняя ферма
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-leaf-900 md:text-6xl">
            Купили семена? Добавьте их в приложение, а мы подскажем, что делать дальше.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
            SeedCare ведёт растение по простым шагам: когда поливать, когда ждать всходы,
            когда снять плёнку и когда можно собирать первый урожай.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-leaf-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-leaf-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
            >
              Начать бесплатно
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-leaf-100 bg-white px-6 py-3 text-base font-semibold text-leaf-700 transition hover:bg-leaf-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-leaf-100"
            >
              Войти
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-leaf-100 bg-white p-5 shadow-sm shadow-leaf-100/40">
          <div className="rounded-2xl bg-leaf-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-leaf-700">Пример</p>
            <h2 className="mt-3 text-2xl font-bold text-leaf-900">Базилик Арарат</h2>
            <ol className="mt-5 space-y-3 text-base leading-7 text-stone-700">
              <li>1. Посейте неглубоко и увлажните землю.</li>
              <li>2. Держите в тепле и проветривайте мини-тепличку.</li>
              <li>3. После всходов поставьте ближе к свету.</li>
              <li>4. Через несколько недель прищипните верхушку.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
