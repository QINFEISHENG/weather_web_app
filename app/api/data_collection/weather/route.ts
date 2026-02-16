
// DATA COLLECTION
// External REST collaboration: OpenWeather API
// Persist snapshot into DB 
// basically this will fetch the weather data from openweather api and then it will write it into a database
// by using the prima client
 
import { NextResponse } from "next/server";

//  client for the database
import { prisma } from "@/lib/db_client_prisma";

// create a async GET function to handle the GET request to this endpoint
export async function GET(req: Request) {
  // create the search parameters based on this url  
  const { searchParams } = new URL(req.url);
  // get the city  from the search parameters just created.
  const city = searchParams.get("city")?.trim();
 // return the error message if the city is not provided
  if (!city) {
    return NextResponse.json({ error: "Hey! City is required :" }, { status: 400 });
  }
// get the key 
  const key = process.env.OPENWEATHER_API_KEY;
  // return error is the key is not provided
  if (!key) {
    return NextResponse.json(
      { error: "No OPENWEATHER_API_KEY on the server!!" },
      { status: 500 }
    );
  }
   // create the url for the openweather api
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${key}`;

  const r = await fetch(url, { cache: "no-store" });
  const text = await r.text();

  if (!r.ok) {
    return NextResponse.json(
      { error: `OpenWeather ${r.status}: ${text}` },
      { status: 502 }
    );
  }

  const raw = JSON.parse(text);
  // get the data from the raw response and create the payload for the database
  const payload = {
    city: raw?.name ?? city,
    country: raw?.sys?.country ?? null,
    temp_c: raw?.main?.temp ?? null,
    feels_like_c: raw?.main?.feels_like ?? null,
    humidity: raw?.main?.humidity ?? null,
    weather_main: raw?.weather?.[0]?.main ?? null,
    weather_desc: raw?.weather?.[0]?.description ?? null,
    observed_unix: raw?.dt ?? null,
  };

  // write the data into the database by using the prisma client
  await prisma.weatherSnapshot.create({ data: payload });

  return NextResponse.json(payload);
}