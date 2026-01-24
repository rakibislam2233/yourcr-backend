import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import logger from '../utils/logger';

// Database configuration
export const databaseConfig = {
  url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/yourcr_backend',
  
  // Connection pool settings
  pool: {
    min: 2,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  // Retry settings
  retry: {
    attempts: 5,
    delay: 1000,
  },
  
  // Prisma settings
  prisma: {
    log: ['query', 'info', 'warn', 'error'] as ('query' | 'info' | 'warn' | 'error')[],
  }
};

// Global Prisma client instance
let prisma: PrismaClient | null = null;

// Create PostgreSQL pool
export const createPool = () => {
  const pool = new Pool({
    connectionString: databaseConfig.url,
    ...databaseConfig.pool,
  });
  
  // Pool event listeners
  pool.on('connect', () => {
    logger.info('✅ Database pool connection established');
  });
  
  pool.on('error', (err) => {
    logger.error('❌ Database pool error:', err);
  });
  
  pool.on('acquire', () => {
    logger.debug('_acquire database connection from pool');
  });
  
  pool.on('release', () => {
    logger.debug('_release database connection back to pool');
  });
  
  return pool;
};

// Create Prisma adapter
export const createPrismaAdapter = (pool: Pool) => {
  return new PrismaPg(pool);
};

// Initialize Prisma Client
export const initializePrisma = (): PrismaClient => {
  if (prisma) {
    return prisma;
  }
  
  const pool = createPool();
  const adapter = createPrismaAdapter(pool);
  
  prisma = new PrismaClient({
    adapter,
    log: databaseConfig.prisma.log,
  });
  
  return prisma;
};

// Get Prisma client instance
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Prisma client not initialized. Call initializePrisma() first.');
  }
  return prisma;
};

// Connect to database
export const connectDB = async (): Promise<void> => {
  try {
    const client = initializePrisma();
    await client.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    throw error;
  }
};

// Disconnect from database
export const closeDB = async (): Promise<void> => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      prisma = null;
      logger.info('✅ Database disconnected successfully');
    }
  } catch (error) {
    logger.error('❌ Database disconnection error:', error);
  }
};