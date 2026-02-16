// app/api/data_collection/forecast/route.test.ts

jest.mock("@/lib/db_client_prisma", () => ({
  prisma: {
    weatherSnapshot: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    eventLog: {
      create: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/db_client_prisma";
import { GET } from "./route";

describe("GET /api/data_collection/forecast", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.OPENWEATHER_API_KEY = "test-key";
  });

  it("returns 400 if city missing", async () => {
    const req = new Request("http://localhost/api/data_collection/forecast");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("fetches forecast, clears old forecast rows, inserts new rows, logs event", async () => {
    // mock upstream OpenWeather /forecast payload
    const fetchMock = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          city: { name: "New York", country: "US" },
          list: [
            {
              dt: 100,
              main: { temp: 10.5, feels_like: 9.0, humidity: 50 },
              weather: [{ main: "Clouds", description: "broken clouds" }],
            },
            {
              dt: 200,
              main: { temp: 12.0, feels_like: 11.0, humidity: 40 },
              weather: [{ main: "Clear", description: "clear sky" }],
            },
          ],
        }),
        { status: 200 }
      );
    });

    global.fetch = fetchMock as any;

    (prisma.weatherSnapshot.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.weatherSnapshot.createMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.eventLog.create as jest.Mock).mockResolvedValue({ id: 1 });

    const req = new Request(
      "http://localhost/api/data_collection/forecast?city=New%20York"
    );

    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.city).toBe("New York");
    expect(body.country).toBe("US");
    expect(body.inserted).toBe(2);

    // verify upstream call
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // verify DB operations
    expect(prisma.weatherSnapshot.deleteMany).toHaveBeenCalledTimes(1);
    expect(prisma.weatherSnapshot.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.eventLog.create).toHaveBeenCalledTimes(1);

    // check deleteMany arg uses city_key + FORECAST
    const delArg = (prisma.weatherSnapshot.deleteMany as jest.Mock).mock.calls[0][0];
    expect(delArg.where.data_type).toBe("FORECAST");
    expect(delArg.where.city_key).toBe("new york"); // case-insensitive key

    // check inserted data shape
    const createArg = (prisma.weatherSnapshot.createMany as jest.Mock).mock.calls[0][0];
    expect(Array.isArray(createArg.data)).toBe(true);
    expect(createArg.data.length).toBe(2);

    expect(createArg.data[0].city).toBe("New York");
    expect(createArg.data[0].city_key).toBe("new york");
    expect(createArg.data[0].data_type).toBe("FORECAST");
    expect(createArg.data[0].observed_unix).toBe(100);
  });
});