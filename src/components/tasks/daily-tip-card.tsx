import { Card } from "@/components/ui/card";

export function DailyTipCard() {
  return (
    <Card className="bg-yellow-50">
      <p className="text-sm font-semibold uppercase tracking-wide text-yellow-800">Совет дня</p>
      <p className="mt-3 text-lg font-semibold leading-8 text-stone-800">
        Не поливайте растения на всякий случай. Сначала потрогайте землю пальцем:
        если сверху влажно, сегодня вода не нужна.
      </p>
    </Card>
  );
}
