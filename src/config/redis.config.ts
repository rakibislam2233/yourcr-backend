import colors from 'colors';
import Redis from 'ioredis';
import config from './index';

// Single Redis client for everything
const redisClient = new Redis({
  username: config.redis.username || undefined,
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db || 0,

  // Connection settings
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  connectTimeout: 10000,
  lazyConnect: false,

  // Keep connection alive
  keepAlive: 30000,
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

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  await redisClient.quit();
  console.log(colors.green('✅ Redis closed'));
};

export default redisClient;