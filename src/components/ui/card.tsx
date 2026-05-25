import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`rounded-2xl border border-leaf-100 bg-white p-5 shadow-sm shadow-leaf-100/30 md:p-6 ${className}`}>
      {children}
    </section>
  );
}
