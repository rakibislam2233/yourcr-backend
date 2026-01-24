import { PrismaClient } from '@prisma/client';
import { createPool, createPrismaAdapter } from '../config/database.config';
import logger from '../utils/logger';

// Create database pool and adapter
const pool = createPool();
const adapter = createPrismaAdapter(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Connect to database
export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    throw error;
  }
};

// Disconnect from database
export const closeDB = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Database disconnection error:', error);
  }
};

export default prisma;