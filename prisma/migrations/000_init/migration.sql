-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "WeatherSnapshot" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "city_key" TEXT NOT NULL,
    "country" TEXT,
    "temp_c" DOUBLE PRECISION,
    "feels_like_c" DOUBLE PRECISION,
    "humidity" INTEGER,
    "weather_main" TEXT,
    "weather_desc" TEXT,
    "observed_unix" INTEGER,
    "data_type" TEXT NOT NULL DEFAULT 'OBSERVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" SERIAL NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherSnapshot_city_key_data_type_createdAt_idx" ON "WeatherSnapshot"("city_key", "data_type", "createdAt");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_city_key_data_type_observed_unix_idx" ON "WeatherSnapshot"("city_key", "data_type", "observed_unix");

-- CreateIndex
CREATE INDEX "WeatherSnapshot_createdAt_idx" ON "WeatherSnapshot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherSnapshot_city_key_data_type_observed_unix_key" ON "WeatherSnapshot"("city_key", "data_type", "observed_unix");

