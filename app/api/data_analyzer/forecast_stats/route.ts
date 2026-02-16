import { NextResponse } from "next/server";
import { prisma } from "@/lib/db_client_prisma";

const cityKeyOf = (s: string) => s.trim().toLowerCase();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityInput = searchParams.get("city")?.trim();

  if (!cityInput) {
    return NextResponse.json({ error: "city required" }, { status: 400 });
  }

  const city_key = cityKeyOf(cityInput);

  const rows = await prisma.weatherSnapshot.findMany({
    where: {
      city_key,
      data_type: "FORECAST",
      observed_unix: { not: null },
      temp_c: { not: null },
    },
    orderBy: { observed_unix: "asc" },
    select: {
      city: true,
      country: true,
      observed_unix: true,
      temp_c: true,
      humidity: true,
      weather_main: true,
      weather_desc: true,
    },
  });

  if (rows.length === 0) {
    return NextResponse.json({
      city: cityInput,
      city_key,
      count: 0,
      avg: null,
      min: null,
      max: null,
      points: [],
    });
  }

  const temps = rows.map((r) => r.temp_c as number);
  const sum = temps.reduce((a, b) => a + b, 0);
  const avg = sum / temps.length;
  const min = Math.min(...temps);
  const max = Math.max(...temps);

  const cityName = rows[0].city;
  const country = rows[0].country ?? null;


  const minRow = rows.find((r) => r.temp_c === min) ?? null;
  const maxRow = rows.find((r) => r.temp_c === max) ?? null;

  return NextResponse.json({
    city: cityName,
    country,
    city_key,
    count: temps.length,
    avg,
    min,
    max,
    min_at: minRow?.observed_unix ?? null,
    max_at: maxRow?.observed_unix ?? null,
    points: rows,
  });
}