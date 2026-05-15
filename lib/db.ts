import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function createPrisma() {
  // dev.db is at project root (where prisma.config.ts resolves file:./dev.db)
  const dbPath = path.resolve(process.cwd(), "dev.db").replace(/\\/g, "/");
  const adapter = new PrismaLibSql({ url: `file:///${dbPath}` });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createPrisma();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
