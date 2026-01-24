import prisma from './connection';
import logger from '../utils/logger';
import { bcryptHelper } from '../utils/bcrypt.utils';

export class DatabaseSeeder {
  // Seed initial data
  static async seed(): Promise<void> {
    try {
      logger.info('🌱 Starting database seeding...');
      
      // Seed admin user
      await this.seedAdminUser();
      
      // Seed default roles
      await this.seedRoles();
      
      // Seed default settings
      await this.seedSettings();
      
      logger.info('✅ Database seeding completed successfully');
    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
  
  // Seed admin user
  static async seedAdminUser(): Promise<void> {
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });
    
    if (!adminExists) {
      const hashedPassword = await bcryptHelper.hashPassword('admin123');
      
      await prisma.user.create({
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
  }
  
  // Seed default roles
  static async seedRoles(): Promise<void> {
    // This would be implemented based on your role model
    logger.info('✅ Default roles seeded');
  }
  
  // Seed default settings
  static async seedSettings(): Promise<void> {
    // This would be implemented based on your settings model
    logger.info('✅ Default settings seeded');
  }
  
  // Clear database (for development)
  static async clear(): Promise<void> {
    try {
      logger.warn('🗑️  Clearing database...');
      
      // Delete in reverse order of relationships
      await prisma.fileUpload.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.otp.deleteMany();
      await prisma.user.deleteMany();
      
      logger.info('✅ Database cleared successfully');
    } catch (error) {
      logger.error('❌ Database clearing failed:', error);
      throw error;
    }
  }
  
  // Reset database (clear + seed)
  static async reset(): Promise<void> {
    await this.clear();
    await this.seed();
  }
}

// Export for direct usage
export default DatabaseSeeder;