import { NextResponse } from "next/server";
import { prisma } from "@/lib/db_client_prisma";

const cityKeyOf = (s: string) => s.trim().toLowerCase();

export async function GET(req: Request) {
  const t0 = Date.now();
  const requestId = crypto.randomUUID();

  const { searchParams } = new URL(req.url);
  const cityInput = searchParams.get("city")?.trim();

  if (!cityInput) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "missing OPENWEATHER_API_KEY" }, { status: 500 });
  }

  console.log("[forecast_collect] start", { requestId, cityInput });

  // FREE forecast: 5 day / 3 hour
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    cityInput
  )}&units=metric&appid=${key}`;

  const r = await fetch(url, { cache: "no-store" });
  const text = await r.text();

  if (!r.ok) {
    console.warn("[forecast_collect] upstream_error", {
      requestId,
      status: r.status,
      ms: Date.now() - t0,
    });
    return NextResponse.json({ error: `OpenWeather ${r.status}: ${text}` }, { status: 502 });
  }

  const raw = JSON.parse(text);

  const cityName: string = raw?.city?.name ?? cityInput;
  const country: string | null = raw?.city?.country ?? null;
  const city_key = cityKeyOf(cityName);

  const list: any[] = raw?.list ?? [];


  const rows = list
    .map((x) => {
      const dt: number | null = typeof x?.dt === "number" ? x.dt : null;

      return {
        city: cityName,
        city_key,
        country,
        temp_c: x?.main?.temp ?? null,
        feels_like_c: x?.main?.feels_like ?? null,
        humidity: x?.main?.humidity ?? null,
        weather_main: x?.weather?.[0]?.main ?? null,
        weather_desc: x?.weather?.[0]?.description ?? null,
        observed_unix: dt,         
        data_type: "FORECAST",
      };
    })

    .filter((x) => typeof x.observed_unix === "number");


  await prisma.weatherSnapshot.deleteMany({
    where: { city_key, data_type: "FORECAST" },
  });

  await prisma.weatherSnapshot.createMany({ data: rows });

  await prisma.eventLog.create({
    data: {
      eventType: "FORECAST_REFRESHED",
      payload: {
        requestId,
        city_input: cityInput,
        city: cityName,
        city_key,
        inserted: rows.length,
        ms: Date.now() - t0,
      },
    },
  });

  console.log("[forecast_collect] ok", {
    requestId,
    city: cityName,
    inserted: rows.length,
    ms: Date.now() - t0,
  });

  return NextResponse.json({
    city: cityName,
    country,
    city_key,
    inserted: rows.length,
  });
}