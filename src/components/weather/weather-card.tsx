import { Card } from "@/components/ui/card";

type WeatherCardProps = {
  weather:
    | {
        locationConfigured: false;
      }
    | {
        locationConfigured: true;
        currentTemp: number;
        condition: string;
        plantWarnings: string[];
        provider: string;
      };
};

export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
        Погода для растений
      </p>
      {!weather.locationConfigured ? (
        <p className="mt-3 text-base leading-7 text-stone-600">
          Укажите город в профиле, и мы будем предупреждать о холоде, жаре и ветре.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          <div>
            <p className="text-4xl font-bold text-leaf-700">{Math.round(weather.currentTemp)}°</p>
            <p className="mt-1 text-stone-600">{weather.condition}</p>
          </div>
          {weather.plantWarnings.length === 0 ? (
            <p className="rounded-2xl bg-leaf-50 p-3 text-sm leading-6 text-leaf-700">
              Погода спокойная. Особых предупреждений для растений нет.
            </p>
          ) : (
            <ul className="space-y-2">
              {weather.plantWarnings.map((warning) => (
                <li key={warning} className="rounded-2xl bg-yellow-50 p-3 text-sm leading-6 text-yellow-900">
                  {warning}
                </li>
              ))}
            </ul>
          )}
          {weather.provider === "mock" ? (
            <p className="text-xs font-semibold text-stone-400">Используется демо-прогноз.</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
