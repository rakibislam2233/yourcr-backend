import colors from 'colors';
import Redis from 'ioredis';
import config from './index';

export const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  username: config.redis.username || undefined,
  db: config.redis.db || 0,

  // Connection settings
  retryStrategy(times) {
    if (times > 10) {
      console.error(colors.red('❌ Redis retry limit exceeded'));
      return null; // Stop retrying after 10 attempts
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: false,

  // Additional settings
  enableReadyCheck: true,
  enableOfflineQueue: true,
  keepAlive: 30000,

  // Reconnect on specific errors
  reconnectOnError: err => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

// Event listeners
redisClient.on('connect', () => {
  console.log(colors.green('✅ Redis connected'));
});

redisClient.on('ready', () => {
  console.log(colors.green('✅ Redis ready'));
});

redisClient.on('error', error => {
  console.error(colors.red('❌ Redis error:'), error.message);
});

redisClient.on('close', () => {
  console.log(colors.yellow('⚠️ Redis disconnected'));
});

redisClient.on('reconnecting', () => {
  console.log(colors.yellow('🔄 Redis reconnecting...'));
});

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    console.log(colors.green('✅ Redis closed gracefully'));
  } catch (error) {
    console.error(colors.red('❌ Error closing Redis:'), error);
    redisClient.disconnect(); // Force disconnect if quit fails
  }
};
