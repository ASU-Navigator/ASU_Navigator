import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Cast needed: adapter is a Prisma v7 runtime option not yet reflected in generated types
export const prisma = new PrismaClient(
  { adapter } as unknown as ConstructorParameters<typeof PrismaClient>[0],
);
