import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getWeatherForecast } from "@/server/services/weather.service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }

  if (!user.city && (typeof user.latitude !== "number" || typeof user.longitude !== "number")) {
    return NextResponse.json({
      locationConfigured: false,
      currentTemp: null,
      condition: null,
      forecast: null,
      plantWarnings: []
    });
  }

  try {
    const weather = await getWeatherForecast({
      city: user.city,
      country: user.country,
      latitude: user.latitude,
      longitude: user.longitude
    });

    return NextResponse.json({
      locationConfigured: true,
      ...weather
    });
  } catch (error) {
    console.error("SeedCare weather error", error);
    return NextResponse.json(
      { error: "Не получилось получить погоду. Попробуйте позже." },
      { status: 502 }
    );
  }
}
