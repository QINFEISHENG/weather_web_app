-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city" TEXT NOT NULL,
    "country" TEXT,
    "temp_c" REAL,
    "feels_like_c" REAL,
    "humidity" INTEGER,
    "weather_main" TEXT,
    "weather_desc" TEXT,
    "observed_unix" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "WeatherSnapshot_city_createdAt_idx" ON "WeatherSnapshot"("city", "createdAt");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_createdAt_idx" ON "WeatherSnapshot"("createdAt");
