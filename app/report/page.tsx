"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const city = useMemo(() => (searchParams.get("city") ?? "").trim(), [searchParams]);

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    (async () => {
      setLoading(true);
      setError("");
      setData(null);

      try {
        const res = await fetch(
          `/api/data_analyzer/weather_stats?city=${encodeURIComponent(city)}`,
          { cache: "no-store" }
        );
        const text = await res.text();
        if (!res.ok) {
          setError(`HTTP ${res.status}: ${text}`);
          return;
        }
        setData(JSON.parse(text));
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [city]);

  if (!city) {
    return (
      <main style={{ padding: 24, fontFamily: "Inter, Arial, sans-serif" }}>
        <h1 style={{ color: "#000" }}>Report</h1>
        <p style={{ color: "#dc2626" }}>Missing city in query string.</p>
      </main>
    );
  }

  const analysis = data?.analysis ?? data;
  const temp = analysis?.temp;
  const humidity = analysis?.humidity;
  const sampleCount = analysis?.sample_count;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
        padding: 24,
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: "#000", marginBottom: 8 }}>📊 Weather Report</h1>
        <p style={{ color: "#555", marginTop: 0 }}>
          City: <strong>{city}</strong>
        </p>

        {loading && <p style={{ color: "#555" }}>Loading analyzer...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {data && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 20,
            }}
          >
            <Card title="Samples" value={sampleCount ?? "N/A"} />
            <Card title="Temp Avg (°C)" value={temp?.avg ?? "N/A"} />
            <Card title="Temp Min (°C)" value={temp?.min ?? "N/A"} />
            <Card title="Temp Max (°C)" value={temp?.max ?? "N/A"} />
            <Card title="Humidity Avg (%)" value={humidity?.avg ?? "N/A"} />
            <Card title="Humidity Min (%)" value={humidity?.min ?? "N/A"} />
            <Card title="Humidity Max (%)" value={humidity?.max ?? "N/A"} />
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>{title}</div>
      <div style={{ color: "#000", fontSize: 24, fontWeight: 700 }}>{String(value)}</div>
    </div>
  );
}