import { PrismaClient } from '../generated/prisma/client';
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma: PrismaClient;

// Initialize Prisma client with adapter
if (process.env.NODE_ENV === "production") {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // In development, avoid hot-reloading issues
  const globalWithPrisma = global as typeof global & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalWithPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalWithPrisma.prisma;
}

/**
 * Connect to the database
 */
const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Close the database connection
 */
const closeDB = async (): Promise<void> => {
  await prisma.$disconnect();
};

/**
 * Get the Prisma client instance
 */
const getPrismaClient = (): PrismaClient => {
  return prisma;
};

export { prisma, connectDB, closeDB, getPrismaClient };