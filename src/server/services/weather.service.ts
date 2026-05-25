export type WeatherInput = {
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type WeatherForecastDay = {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  maxWindKph: number;
  isCloudy: boolean;
};

export type WeatherForecast = {
  currentTemp: number;
  condition: string;
  forecast: string;
  plantWarnings: string[];
  days: WeatherForecastDay[];
  provider: "mock" | "weatherapi";
};

export interface WeatherProvider {
  getForecast(input: WeatherInput): Promise<WeatherForecast>;
}

function createPlantWarnings(days: WeatherForecastDay[]) {
  const warnings: string[] = [];
  const minTemp = Math.min(...days.map((day) => day.minTemp));
  const maxTemp = Math.max(...days.map((day) => day.maxTemp));
  const maxWind = Math.max(...days.map((day) => day.maxWindKph));
  const cloudyDays = days.filter((day) => day.isCloudy).length;

  if (minTemp < 8) {
    warnings.push("Ночью холодно. Рассаду лучше занести домой или накрыть.");
  }

  if (maxTemp > 28) {
    warnings.push("Жарко. Проверьте влажность земли утром и вечером.");
  }

  if (maxWind >= 35) {
    warnings.push("Если растение на открытом балконе, лучше переставить ближе к стене.");
  }

  if (cloudyDays >= 2) {
    warnings.push("Может не хватать света. Поставьте ближе к окну или используйте лампу.");
  }

  return warnings;
}

function buildForecastText(days: WeatherForecastDay[]) {
  return days
    .map((day) => `${day.date}: ${day.condition}, ${Math.round(day.minTemp)}-${Math.round(day.maxTemp)}°C`)
    .join("; ");
}

class MockWeatherProvider implements WeatherProvider {
  async getForecast(input: WeatherInput): Promise<WeatherForecast> {
    console.info("SeedCare weather: WEATHER_API_KEY is not set, using mock weather provider.");

    const city = input.city || "вашем городе";
    const days: WeatherForecastDay[] = [
      {
        date: "Сегодня",
        minTemp: 16,
        maxTemp: 24,
        condition: `Солнечно в ${city}`,
        maxWindKph: 12,
        isCloudy: false
      },
      {
        date: "Завтра",
        minTemp: 15,
        maxTemp: 23,
        condition: "Переменная облачность",
        maxWindKph: 18,
        isCloudy: true
      },
      {
        date: "Послезавтра",
        minTemp: 14,
        maxTemp: 22,
        condition: "Облачно",
        maxWindKph: 16,
        isCloudy: true
      }
    ];

    return {
      currentTemp: 22,
      condition: "солнечно",
      forecast: buildForecastText(days),
      plantWarnings: createPlantWarnings(days),
      days,
      provider: "mock"
    };
  }
}

class WeatherApiProvider implements WeatherProvider {
  async getForecast(input: WeatherInput): Promise<WeatherForecast> {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      throw new Error("WEATHER_API_KEY is not set.");
    }

    const query =
      typeof input.latitude === "number" && typeof input.longitude === "number"
        ? `${input.latitude},${input.longitude}`
        : [input.city, input.country].filter(Boolean).join(",");

    if (!query) {
      throw new Error("Weather location is empty.");
    }

    const url = new URL("https://api.weatherapi.com/v1/forecast.json");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("days", "3");
    url.searchParams.set("aqi", "no");
    url.searchParams.set("alerts", "no");
    url.searchParams.set("lang", "ru");

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${await response.text()}`);
    }

    const data = (await response.json()) as {
      current: {
        temp_c: number;
        condition: { text: string };
      };
      forecast: {
        forecastday: Array<{
          date: string;
          day: {
            mintemp_c: number;
            maxtemp_c: number;
            maxwind_kph: number;
            condition: { text: string };
            daily_chance_of_rain?: number;
          };
        }>;
      };
    };

    const days = data.forecast.forecastday.map((day) => {
      const condition = day.day.condition.text;
      const normalizedCondition = condition.toLowerCase();

      return {
        date: new Date(`${day.date}T00:00:00`).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long"
        }),
        minTemp: day.day.mintemp_c,
        maxTemp: day.day.maxtemp_c,
        condition,
        maxWindKph: day.day.maxwind_kph,
        isCloudy:
          normalizedCondition.includes("облач") ||
          normalizedCondition.includes("пасмур") ||
          normalizedCondition.includes("cloud") ||
          (day.day.daily_chance_of_rain ?? 0) > 60
      };
    });

    return {
      currentTemp: data.current.temp_c,
      condition: data.current.condition.text,
      forecast: buildForecastText(days),
      plantWarnings: createPlantWarnings(days),
      days,
      provider: "weatherapi"
    };
  }
}

export function getWeatherProvider(): WeatherProvider {
  return process.env.WEATHER_API_KEY ? new WeatherApiProvider() : new MockWeatherProvider();
}

export async function getWeatherForecast(input: WeatherInput) {
  return getWeatherProvider().getForecast(input);
}
