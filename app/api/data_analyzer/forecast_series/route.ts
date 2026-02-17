// app/api/data_analyzer/forecast_series/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db_client_prisma";
import { cityKeyOf } from "@/lib/city_key"; 

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityInput = (searchParams.get("city") ?? "").trim();

  if (!cityInput) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }

  const city_key = cityKeyOf(cityInput);

  const rows = await prisma.weatherSnapshot.findMany({
    where: {
      // use city key to make it more robust!!!!
      city_key,
      data_type: "FORECAST",
      observed_unix: { not: null },
    },
    orderBy: { observed_unix: "asc" },
    select: {
      city:          true,
      country:       true,
      observed_unix: true,
      temp_c:        true,
      humidity:      true,
      weather_main:  true,
      weather_desc:  true,
    },
  });

  return NextResponse.json({
    city: rows[0]?.city ?? cityInput,
    city_key,
    count: rows.length,
    points: rows.map((r) => ({
      t:         r.observed_unix as number,
      temp_c:    r.temp_c,
      humidity:  r.humidity,
      main:      r.weather_main,
      desc:      r.weather_desc,
    })),
  });
}