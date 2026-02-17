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
  min_at?: number | null; 
  max_at?: number | null; 
};

type ForecastSeriesResponse = {
  city: string;
  city_key?: string;
  count: number;
  points: Array<{
    t: number; 
    temp_c: number | null;
    humidity: number | null;
    main?: string | null;
    desc?: string | null;
  }>;
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

function formatHour(unix: number) {
  const d = new Date(unix * 1000);
  return d.toLocaleString(undefined, { weekday: "short", hour: "2-digit" });
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

// only use the basic chart
function TempLineChart(props: {
  points: Array<{t: number; temp_c: number | null }>;
}) {
  const cleaned = props.points
    .filter((p) => typeof p.temp_c === "number" && Number.isFinite(p.temp_c as number))
    .map((p) => ({t: p.t, y: p.temp_c as number }));

  if (cleaned.length < 2) {
    return (
      <div style={{ color: "#6b7280", marginTop: "10px" }}>
        Not enough data to draw chart.
      </div>
    );
  }
  const W = 980;
  const H = 220;
  const pad = 30;
  const minY = Math.min(...cleaned.map((p) => p.y));
  const maxY = Math.max(...cleaned.map((p) => p.y));
  const minX = Math.min(...cleaned.map((p) => p.t));
  const maxX = Math.max(...cleaned.map((p) => p.t));
  const scaleX = (t: number) =>
    pad + ((t - minX) / (maxX - minX)) * (W - pad * 2);
  const scaleY = (y: number) => {
    if (maxY === minY) return H / 2;
    // reverse the y axis
    return pad + (1 - (y - minY) / (maxY - minY)) * (H - pad * 2);
  };
  const d = cleaned
    .map((p, i) => {
      const x = scaleX(p.t);
      const y = scaleY(p.y);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  // pick 5 ticks
  const ticks = 5;
  const xTicks = Array.from({ length: ticks }, (_, i) => {
    const t = minX + ((maxX - minX) * i) / (ticks - 1);
    return t;
  });

  return (
    <div style={{ background: "white", borderRadius: "18px", padding: "18px", boxShadow: "0 18px 36px rgba(0,0,0,0.08)" }}>
      <div style={{ color: "#111827", fontWeight: 700, marginBottom: "10px" }}>
        Next 5 Days Temperature Trend (°C)
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        {/* grid */}
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#e5e7eb" />
        <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#e5e7eb" />

        {/* line */}
        <path d={d} fill="none" stroke="#4f46e5" strokeWidth="3" />

        {/* points */}
        {cleaned.map((p, idx) => (
          <circle
            key={idx}
            cx={scaleX(p.t)}
            cy={scaleY(p.y)}
            r="4"
            fill="#4f46e5"
          />
        ))}

        {/* y labels */}
        <text x={pad} y={pad - 8} fontSize="12" fill="#6b7280">
          {formatNumber(maxY, 1)}°C
        </text>
        <text x={pad} y={H - 6} fontSize="12" fill="#6b7280">
          {formatNumber(minY, 1)}°C
        </text>

        {/* x ticks */}
        {xTicks.map((t, i) => (
          <text
            key={i}
            x={scaleX(t)}
            y={H - 8}
            fontSize="12"
            fill="#6b7280"
            textAnchor="middle"
          >
            {formatHour(t)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function ReportPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const city = useMemo(() => (sp.get("city") ?? "").trim(), [sp]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<ForecastStatsResponse | null>(null);
  const [series, setSeries] = useState<ForecastSeriesResponse | null>(null);

  const current = useMemo(() => {
    const pts = series?.points ?? [];
    const last = [...pts].reverse().find((p) => typeof p.temp_c === "number");
    return last ?? null;
  }, [series]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError("");
      setLoading(true);
      setStats(null);
      setSeries(null);

      if (!city) {
        setLoading(false);
        setError("City is missing in URL. Go back and enter a city.");
        return;
      }

      try {
        const [resStats, resSeries] = await Promise.all([
          fetch(`/api/data_analyzer/forecast_stats?city=${encodeURIComponent(city)}`),
          fetch(`/api/data_analyzer/forecast_series?city=${encodeURIComponent(city)}`),
        ]);

        const [textStats, textSeries] = await Promise.all([
          resStats.text(),
          resSeries.text(),
        ]);

        if (!resStats.ok) {
          if (!cancelled) setError(`Stats HTTP ${resStats.status}: ${textStats}`);
          return;
        }
        if (!resSeries.ok) {
          if (!cancelled) setError(`Series HTTP ${resSeries.status}: ${textSeries}`);
          return;
        }

        const statsData = JSON.parse(textStats) as ForecastStatsResponse;
        const seriesData = JSON.parse(textSeries) as ForecastSeriesResponse;

        if (!cancelled) {
          setStats(statsData);
          setSeries(seriesData);
        }
      } catch (e) {
        if (!cancelled) setError(`Fetch error: ${String(e)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return ()=> {
      cancelled = true;
    };
  }, [city]);

  return (
    <main
      style={{
        minHeight:"100vh",
        background:"#f3f6ff",
        padding:"36px 28px",
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
          <div style={{ marginTop:"22px",color:"#111827" }}>Loading!!</div>
        ) : error ? (
          <div style={{ marginTop:"22px",color:"#dc2626" }}>{error}</div>
        ) : (
          <>
            {/* cards */}
            <div
              style={{
                marginTop: "26px",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "18px",
              }}
            >
              <Card title="Samples" value={stats ? String(stats.count) : "N/A"} />

              <Card title="Temp Avg (°C)" value={formatNumber(stats?.avg ?? null, 1)} />

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

              <Card
                title="Current Temp (°C)"
                value={formatNumber(current?.temp_c ?? null, 1)}
                sub={current?.t ? `at ${formatUnix(current.t)}` : undefined}
              />

              <Card
                title="Current Humidity (%)"
                value={
                  current?.humidity === null || current?.humidity === undefined
                    ? "N/A"
                    : String(current.humidity)
                }
                sub={current?.desc ? `${current.desc}` : undefined}
              />
            </div>

            {/*this is the chart part*/}
            <div style={{ marginTop: "18px" }}>
              <TempLineChart
                points={(series?.points ??[]).map((p) =>({t:p.t,temp_c:p.temp_c }))}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}