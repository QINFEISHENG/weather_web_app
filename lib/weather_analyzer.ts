export type Snapshot = {
  observed_unix: number | null;
  temp_c: number | null;
  humidity: number | null;
};

const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const min = (arr: number[]) => (arr.length ? Math.min(...arr) : null);
const max = (arr: number[]) => (arr.length ? Math.max(...arr) : null);

export function analyzeSnapshots(rows: Snapshot[]) {
  const temps = rows.map(r => r.temp_c).filter((v): v is number => typeof v === "number");
  const hums = rows.map(r => r.humidity).filter((v): v is number => typeof v === "number");

  return {
    sample_count: rows.length,
    temp: { avg: avg(temps), min: min(temps), max: max(temps) },
    humidity: { avg: avg(hums), min: min(hums), max: max(hums) },
  };
}