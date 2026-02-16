"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type ForecastStatsResponse = {
  city: string;
  city_key?: string;
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
  min_at?: number | null; // unix
  max_at?: number | null; // unix
};

function formatNumber(v: number | null | undefined, digits = 1) {
  if (v === null || v === undefined) return "N/A";
  if (!Number.isFinite(v)) return "N/A";
  return v.toFixed(digits);
}

function formatUnix(unix: number | null | undefined) {
  if (!unix) return "N/A";
  const d = new Date(unix * 1000);
  return d.toLocaleString();
}

function Card(props: { title: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "22px",
        boxShadow: "0 18px 36px rgba(0,0,0,0.08)",
        minHeight: "110px",
      }}
    >
      <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "10px" }}>
        {props.title}
      </div>
      <div style={{ color: "#111827", fontSize: "34px", fontWeight: 700 }}>
        {props.value}
      </div>
      {props.sub ? (
        <div style={{ marginTop: "8px", color: "#6b7280", fontSize: "13px" }}>
          {props.sub}
        </div>
      ) : null}
    </div>
  );
}

export default function ReportClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const city = useMemo(() => (sp.get("city") ?? "").trim(), [sp]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<ForecastStatsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError("");
      setLoading(true);
      setStats(null);

      if (!city) {
        setLoading(false);
        setError("City is missing in URL. Go back and enter a city.");
        return;
      }

      try {
        const res = await fetch(
          `/api/data_analyzer/forecast_stats?city=${encodeURIComponent(city)}`,
          { method: "GET" }
        );
        const text = await res.text();

        if (!res.ok) {
          if (!cancelled) setError(`HTTP ${res.status}: ${text}`);
          return;
        }

        const data = JSON.parse(text) as ForecastStatsResponse;
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setError(`Fetch error: ${String(e)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f6ff",
        padding: "36px 28px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ fontSize: "28px" }}>📊</div>
          <h1 style={{ margin: 0, color: "#111827" }}>Weather Report</h1>
        </div>

        <div style={{ marginTop: "10px", color: "#6b7280", fontSize: "18px" }}>
          City: <strong style={{ color: "#111827" }}>{city || "N/A"}</strong>
        </div>

        <div style={{ marginTop: "18px", display: "flex", gap: "12px" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Back
          </button>

          <button
            onClick={() => router.refresh()}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ marginTop: "22px", color: "#111827" }}>Loading…</div>
        ) : error ? (
          <div style={{ marginTop: "22px", color: "#dc2626" }}>{error}</div>
        ) : (
          <div
            style={{
              marginTop: "26px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <Card title="Samples" value={stats ? String(stats.count) : "N/A"} />

            <Card
              title="Temp Avg (°C)"
              value={formatNumber(stats?.avg ?? null, 1)}
            />

            <Card
              title="Temp Min (°C)"
              value={formatNumber(stats?.min ?? null, 1)}
              sub={stats?.min_at ? `at ${formatUnix(stats.min_at)}` : undefined}
            />

            <Card
              title="Temp Max (°C)"
              value={formatNumber(stats?.max ?? null, 1)}
              sub={stats?.max_at ? `at ${formatUnix(stats.max_at)}` : undefined}
            />
          </div>
        )}
      </div>
    </main>
  );
}