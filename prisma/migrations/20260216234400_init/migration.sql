-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city" TEXT NOT NULL,
    "city_key" TEXT NOT NULL,
    "country" TEXT,
    "temp_c" REAL,
    "feels_like_c" REAL,
    "humidity" INTEGER,
    "weather_main" TEXT,
    "weather_desc" TEXT,
    "observed_unix" INTEGER,
    "data_type" TEXT NOT NULL DEFAULT 'OBSERVED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "WeatherSnapshot_city_key_data_type_createdAt_idx" ON "WeatherSnapshot"("city_key", "data_type", "createdAt");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_city_key_data_type_observed_unix_idx" ON "WeatherSnapshot"("city_key", "data_type", "observed_unix");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_createdAt_idx" ON "WeatherSnapshot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherSnapshot_city_key_data_type_observed_unix_key" ON "WeatherSnapshot"("city_key", "data_type", "observed_unix");
