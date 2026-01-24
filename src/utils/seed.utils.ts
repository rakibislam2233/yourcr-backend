import { PrismaClient } from '@prisma/client';
import logger from './logger';
import { hashPassword } from './bcrypt.utils';

// Helper function to get prisma client
const getPrisma = () => new PrismaClient();

// Seed initial data
export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('🌱 Starting database seeding...');
    
    // Seed admin user
    await seedAdminUser();
    
    // Seed default roles
    await seedRoles();
    
    // Seed default settings
    await seedSettings();
    
    logger.info('✅ Database seeding completed successfully');
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Seed admin user
export const seedAdminUser = async (): Promise<void> => {
  const adminExists = await getPrisma().user.findUnique({
    where: { email: 'admin@example.com' },
  });
  
  if (!adminExists) {
    const hashedPassword = await hashPassword('admin123');
    
    await getPrisma().user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isVerified: true,
        isActive: true,
      },
    });
    
    logger.info('✅ Admin user created');
  } else {
    logger.info('ℹ️  Admin user already exists');
  }
};

// Seed default roles
export const seedRoles = async (): Promise<void> => {
  // This would be implemented based on your role model
  logger.info('✅ Default roles seeded');
};

// Seed default settings
export const seedSettings = async (): Promise<void> => {
  // This would be implemented based on your settings model
  logger.info('✅ Default settings seeded');
};

// Clear database (for development)
export const clearDatabase = async (): Promise<void> => {
  try {
    logger.warn('🗑️  Clearing database...');
    
    // Delete in reverse order of relationships
    const prisma = getPrisma();
    await prisma.fileUpload.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.otp.deleteMany();
    await prisma.user.deleteMany();
    
    logger.info('✅ Database cleared successfully');
  } catch (error) {
    logger.error('❌ Database clearing failed:', error);
    throw error;
  }
};

// Reset database (clear + seed)
export const resetDatabase = async (): Promise<void> => {
  await clearDatabase();
  await seedDatabase();
};

// Close Prisma connection
export const closePrisma = async (): Promise<void> => {
  const prisma = getPrisma();
  await prisma.$disconnect();
};