"use client";

import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [temperature, setTemperature] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTemperature(null);

    if (!city) {
      setError("Please enter a city name.");
      return;
    }

    try {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}`;

  const res = await fetch(url);

  const text = await res.text(); 
  console.log("Weather URL:", url);
  console.log("Status:", res.status);
  console.log("Body:", text);

  if (!res.ok) {
    setError(`HTTP ${res.status}: ${text}`);
    return;
  }

  const data = JSON.parse(text);
  setTemperature(data.main.temp);
} catch (err) {
  setError(`Fetch error: ${String(err)}`);
}
  };

  return (
    <main style={{ padding: "300px", fontFamily: "Arial" }}>
      <h1>Weather Web App</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a city (e.g. New York)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: "15px", marginRight: "15px" }}
        />
        <button type="submit">Get Weather</button>
      </form>

      {temperature !== null && (
        <p style={{ marginTop: "30px" }}>
          🌡️ <strong>Temperature in {city}:</strong> {temperature}°C
        </p>
      )}

      {error && (
        <p style={{ marginTop: "30px", color: "red" }}>
          {error}
        </p>
      )}
    </main>
  );
}