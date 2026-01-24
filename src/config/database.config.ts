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
};

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