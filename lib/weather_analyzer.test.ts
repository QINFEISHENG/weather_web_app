//This is the unit test part !!!!
// import the fuction to be tested
import { analyzeSnapshots } from "./weather_analyzer";


describe("Unit test for the weather_analyzer ", () => {
  it("computes avg min max values and also it will ignores nulls", () => {
    //add some fake data for the test
    const all_tests = [
      { observed_unix: 1, temp_c: 10, humidity: 50 },
      { observed_unix: 2, temp_c: 30, humidity: null },
      { observed_unix: 3, temp_c: null, humidity: 70 },
      { observed_unix: 4, temp_c: null, humidity: null },
    ];
    //
    const result = analyzeSnapshots(all_tests);
    expect(result.sample_count).toBe(4);
    // test the calculation on the temperatur 
    expect(result.temp.min).toBe(10);
    expect(result.temp.max).toBe(30);
    expect(result.temp.avg).toBe(20);
    // test the calculation on the humidity 
    expect(result.humidity.min).toBe(50);
    expect(result.humidity.max).toBe(70);
    expect(result.humidity.avg).toBe(60);
  });
});