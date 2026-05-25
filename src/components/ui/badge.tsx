import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "green" | "yellow" | "neutral";
};

const tones = {
  green: "bg-leaf-50 text-leaf-700 ring-leaf-100",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-100",
  neutral: "bg-stone-50 text-stone-700 ring-stone-200"
};

export function Badge({ children, tone = "green" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}
