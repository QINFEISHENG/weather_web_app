// app/api/data_analyzer/forecast_stats/route.test.ts

jest.mock("@/lib/db_client_prisma", () => ({
  prisma: {
    weatherSnapshot: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/db_client_prisma";
import { GET } from "./route";

describe("GET /api/data_analyzer/forecast_stats", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 400 if city missing", async () => {
    const req = new Request("http://localhost/api/data_analyzer/forecast_stats");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("returns count=0 if no rows", async () => {
    (prisma.weatherSnapshot.findMany as jest.Mock).mockResolvedValue([]);

    const req = new Request(
      "http://localhost/api/data_analyzer/forecast_stats?city=New%20York"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.count).toBe(0);
    expect(body.avg).toBeNull();
    expect(body.min).toBeNull();
    expect(body.max).toBeNull();
    expect(Array.isArray(body.points)).toBe(true);
  });

  it("computes avg/min/max and returns min_at/max_at", async () => {
    (prisma.weatherSnapshot.findMany as jest.Mock).mockResolvedValue([
      {
        city: "New York",
        country: "US",
        observed_unix: 100,
        temp_c: 10,
        humidity: 50,
        weather_main: "Clouds",
        weather_desc: "broken clouds",
      },
      {
        city: "New York",
        country: "US",
        observed_unix: 200,
        temp_c: 30,
        humidity: 40,
        weather_main: "Clear",
        weather_desc: "clear sky",
      },
      {
        city: "New York",
        country: "US",
        observed_unix: 300,
        temp_c: 20,
        humidity: 60,
        weather_main: "Rain",
        weather_desc: "light rain",
      },
    ]);

    const req = new Request(
      "http://localhost/api/data_analyzer/forecast_stats?city=new%20york"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.city).toBe("New York");
    expect(body.country).toBe("US");
    expect(body.city_key).toBe("new york");

    expect(body.count).toBe(3);
    expect(body.min).toBe(10);
    expect(body.max).toBe(30);
    expect(body.avg).toBe(20); // (10+30+20)/3

    expect(body.min_at).toBe(100);
    expect(body.max_at).toBe(200);

    // make sure query uses city_key and FORECAST
    expect(prisma.weatherSnapshot.findMany).toHaveBeenCalledTimes(1);
    const q = (prisma.weatherSnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(q.where.city_key).toBe("new york");
    expect(q.where.data_type).toBe("FORECAST");
  });
});