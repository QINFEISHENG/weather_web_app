// DATA ANALYZER
// This will reads the snapshots from database
// The ANALYZER part will be  computes count / avg / min / max within last N hours 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db_client_prisma";

//define the GET function to handle the GET request to this endpoint
export async function GET(req: Request) {
  // create the search parmeters for this request url
  const { searchParams } = new URL(req.url);
  // get the city  parameter
  // trim the city in case there is extra space
  const city = searchParams.get("city")?.trim();
  // get the hours parameter set default to 24 if not provided
  const hoursRaw = searchParams.get("hours") ?? "24";
  // convert the hour into number
  const hours = Number(hoursRaw);
  // if no city is provided , return the error
  if (!city) {
    return NextResponse.json({ error: "Hey! City is required :)" }, { status: 400 });
  }
  //make sure the hours is a valid number , so it will be 1 hour to 7 days !
  if (!Number.isFinite(hours) || hours <= 0 || hours > 168) {
    return NextResponse.json(
      { error: "hours must be a number between 1 and 168" },
      { status: 400 }
    );
  }
  // calculate the timestamp for N hours ago
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const cityKey = city.toLowerCase();
  // create the row from the database by using the prisma client
  const rows = await prisma.weatherSnapshot.findMany({
    where: {
      city_key : cityKey,
      createdAt: { gte: since },
      temp_c: { not: null },
    },
    select: { temp_c: true },
  });
  // if there is no data, return null
  if (rows.length === 0) {
    return NextResponse.json({
      city,
      hours,
      count: 0,
      avg: null,
      min: null,
      max: null,
    });
  }
  // calculate the sum , avg ,min, max value of the temp_c
  const temps = rows.map((r) => r.temp_c as number);
  const sum = temps.reduce((a, b) => a + b, 0);
  const avg = sum / temps.length;
  const min = Math.min(...temps);
  const max = Math.max(...temps);
// return the result as json
  return NextResponse.json({
    city,
    hours,
    count: temps.length,
    avg,
    min,
    max,
  });
}