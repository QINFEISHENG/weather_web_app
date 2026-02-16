-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeatherSnapshot" (
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
INSERT INTO "new_WeatherSnapshot" ("city", "city_key", "country", "createdAt", "feels_like_c", "humidity", "id", "observed_unix", "temp_c", "weather_desc", "weather_main") SELECT "city", "city_key", "country", "createdAt", "feels_like_c", "humidity", "id", "observed_unix", "temp_c", "weather_desc", "weather_main" FROM "WeatherSnapshot";
DROP TABLE "WeatherSnapshot";
ALTER TABLE "new_WeatherSnapshot" RENAME TO "WeatherSnapshot";
CREATE INDEX "WeatherSnapshot_city_key_data_type_createdAt_idx" ON "WeatherSnapshot"("city_key", "data_type", "createdAt");
CREATE INDEX "WeatherSnapshot_city_key_data_type_observed_unix_idx" ON "WeatherSnapshot"("city_key", "data_type", "observed_unix");
CREATE INDEX "WeatherSnapshot_createdAt_idx" ON "WeatherSnapshot"("createdAt");
CREATE UNIQUE INDEX "WeatherSnapshot_city_key_data_type_observed_unix_key" ON "WeatherSnapshot"("city_key", "data_type", "observed_unix");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
