import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-leaf-200 bg-leaf-50 p-5 md:p-6">
      <p className="text-lg font-bold text-leaf-700">{title}</p>
      {description ? <p className="mt-2 text-base leading-7 text-stone-600">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
