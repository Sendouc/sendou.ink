// @ts-nocheck
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (!global.prisma) {
  // if you want to show logs for the DB queries use { log: ["query", "info", "warn"] } as parameter below
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

export default prisma;
