"use client";

import type React from "react";
import { useState } from "react";

export default function Home() {
  const [city, setCity] = useState("");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #74ebd5, #9face6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "10px" }}>🌤 Weather App</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Enter a city to get the current temperature
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g. New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              fontSize: "16px",
              marginBottom: "16px",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: "#4f46e5",
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Get Weather
          </button>
        </form>

        {temperature !== null && (
          <div
            style={{
              marginTop: "30px",
              fontSize: "18px",
            }}
          >
            🌡️ <strong>{city}</strong>: {temperature}°C
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px",
              color: "#dc2626",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </main>
  );
}