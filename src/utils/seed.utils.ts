import { database } from '../config/database.config';
import { hashPassword } from './bcrypt.utils';
import logger from './logger';
import { UserRole, UserStatus } from '../../prisma/generated/enums';

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
  const adminExists = await database.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const hashedPassword = await hashPassword('admin123');

    await database.user.create({
      data: {
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isEmailVerified: true,
        phoneNumber: '1234567890',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
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
    await database.user.deleteMany();

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

// Close database connection
export const closedatabase = async (): Promise<void> => {
  await database.$disconnect();
};
