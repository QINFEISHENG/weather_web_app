//Using mock objects +  test doubles
//This tst will use the mock objects to test the GET function 
//replace the real database client with a mock object to check the get fucntion 
jest.mock("@/lib/db_client_prisma", () => ({
  prisma: {
    weatherSnapshot: {
    create: jest.fn(),
    },},}));

import { GET } from "./route";
import { prisma } from "@/lib/db_client_prisma";

describe("GET /api/data_collection/weather (integration)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.OPENWEATHER_API_KEY = "test-key";
  });

  it("returns 400 if city missing", async () => {
    const req = new Request("http://localhost/api/data_collection/weather");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("fetches OpenWeather, persists snapshot, returns payload", async () => {
    //
    const fetchMock = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          name: "New York",
          sys: { country: "US" },
          main: { temp: 10.0, feels_like: 10.0, humidity: 10 },
          weather: [{ main: "Test", description: "Test Test" }],
          dt: 100,
        }),
        { status: 200 }
      );
    });
    // set all the fetch to use the mock function just created
    global.fetch = fetchMock;

    (prisma.weatherSnapshot.create as jest.Mock).mockResolvedValue({ id: 1 });

    const req = new Request(
      "http://localhost/api/data_collection/weather?city=New%20York"
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    // make sure the body is correct based on the mock just created
    expect(body.city).toBe("New York");
    expect(body.country).toBe("US");
    expect(body.temp_c).toBe(10.0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(prisma.weatherSnapshot.create).toHaveBeenCalledTimes(1);
    const callArg = (prisma.weatherSnapshot.create as jest.Mock).mock.calls[0][0];
    expect(callArg.data.city).toBe("New York");
    expect(callArg.data.observed_unix).toBe(100);
  });
});