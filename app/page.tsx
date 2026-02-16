"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [temperature, setTemperature] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setTemperature(null);

    const c = city.trim();
    if (!c) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    try {

      const res = await fetch(
        `/api/data_collection/weather?city=${encodeURIComponent(c)}`,
        { method: "GET" }
      );

      const text = await res.text();
      if (!res.ok) {
        setError(`HTTP ${res.status}: ${text}`);
        return;
      }

      const payload = JSON.parse(text);
      setTemperature(payload?.temp_c ?? null);

      // 2) 跳转到 report page，让 report page 去做 analyzer 展示
      router.push(`/report?city=${encodeURIComponent(c)}`);
    } catch (err) {
      setError(`Fetch error: ${String(err)}`);
    } finally {
      setLoading(false);
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
        <h1 style={{ marginBottom: "10px", color: "#000" }}>🌤 Weather App</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Enter a city to collect data and view the report
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
              color: "#000",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#6366f1" : "#4f46e5",
              opacity: loading ? 0.8 : 1,
              color: "white",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Collecting..." : "Get Weather + Report"}
          </button>
        </form>

        {temperature !== null && (
          <div style={{ marginTop: "30px", fontSize: "20px", color: "#000" }}>
            🌡️ <strong>{city}</strong>: {temperature}°C
          </div>
        )}

        {error && (
          <div style={{ marginTop: "20px", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </div>
        )}
      </div>
    </main>
  );
}