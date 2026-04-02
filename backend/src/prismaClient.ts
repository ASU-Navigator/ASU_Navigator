import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    const adapter = new PrismaPg(pool);
    _prisma = new PrismaClient(
      { adapter } as unknown as ConstructorParameters<typeof PrismaClient>[0],
    );
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as Record<string | symbol, unknown>)[prop];
  },
});
