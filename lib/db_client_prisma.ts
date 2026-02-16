// DATA PERSISTENCE LAYER
// this is the Prisma client singleton for Postgres
// import the class of PrismaClient from @prisma/client
import { PrismaClient } from "@prisma/client";
// declare a global variable for this PrismaClient instance!
declare global {
  //make sure the warning sign is gone .
  // Prevent multiple PrismaClient instances in dev/hot-reload
  var __prisma__: PrismaClient | undefined;
}

// Create a single Prisma client instance
export const prisma: PrismaClient =
  global.__prisma__ ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

// Cache on global in development to avoid repeat DB connections
if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma;
}