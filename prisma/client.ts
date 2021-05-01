// @ts-nocheck
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (!global.prisma) {
  global.prisma = new PrismaClient(
    process.env.NODE_ENV !== "production"
      ? { log: ["query", "info", "warn"] }
      : undefined
  );
}

prisma = global.prisma;

export default prisma;
