/*
  Warnings:

  - Added the required column `city_key` to the `WeatherSnapshot` table without a default value. This is not possible if the table is not empty.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_WeatherSnapshot" ("city", "country", "createdAt", "feels_like_c", "humidity", "id", "observed_unix", "temp_c", "weather_desc", "weather_main") SELECT "city", "country", "createdAt", "feels_like_c", "humidity", "id", "observed_unix", "temp_c", "weather_desc", "weather_main" FROM "WeatherSnapshot";
DROP TABLE "WeatherSnapshot";
ALTER TABLE "new_WeatherSnapshot" RENAME TO "WeatherSnapshot";
CREATE INDEX "WeatherSnapshot_city_createdAt_idx" ON "WeatherSnapshot"("city", "createdAt");
CREATE INDEX "WeatherSnapshot_createdAt_idx" ON "WeatherSnapshot"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
