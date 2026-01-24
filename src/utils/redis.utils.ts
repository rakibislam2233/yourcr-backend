import Redis from 'ioredis';
import { logger } from '../config/logger.config';
import config from '../config';

// Redis client instance
let redisClient: Redis | null = null;

// Initialize Redis connection
export const connectRedis = async (): Promise<Redis> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    db: config.redis.db || 0,
    username: config.redis.username || undefined,

    // Connection settings
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn(`Redis retry attempt ${times}, delaying ${delay}ms`);
      return delay;
    },
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    lazyConnect: false,

    // Keep connection alive
    keepAlive: 30000,

    // Performance settings
    enableOfflineQueue: true,
    enableReadyCheck: true,
  });

  // Event listeners
  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis ready');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis error:', error);
  });

  redisClient.on('close', () => {
    logger.warn('⚠️ Redis disconnected');
  });

  redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis reconnecting...');
  });

  return redisClient;
};

// Get Redis client instance
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Close Redis connection
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('✅ Redis connection closed');
  }
};

// Health check
export const redisHealthCheck = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
};

// Core Redis operations
export const redisSetex = async (key: string, seconds: number, value: string): Promise<string> => {
  const client = getRedisClient();
  return await client.setex(key, seconds, value);
};

export const redisGet = async (key: string): Promise<string | null> => {
  const client = getRedisClient();
  return await client.get(key);
};

export const redisDel = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return await client.del(key);
};

export const redisExists = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return await client.exists(key);
};

export const redisSet = async (key: string, value: string): Promise<string> => {
  const client = getRedisClient();
  return await client.set(key, value);
};

export const redisIncr = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return await client.incr(key);
};

export const redisDecr = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return await client.decr(key);
};

export const redisExpire = async (key: string, seconds: number): Promise<number> => {
  const client = getRedisClient();
  return await client.expire(key, seconds);
};

export const redisTtl = async (key: string): Promise<number> => {
  const client = getRedisClient();
  return await client.ttl(key);
};

export const redisMset = async (data: Record<string, string>): Promise<string> => {
  const client = getRedisClient();
  const keyValueArray: string[] = [];
  Object.entries(data).forEach(([key, value]) => {
    keyValueArray.push(key, value);
  });
  return await client.mset(keyValueArray);
};

export const redisMget = async (keys: string[]): Promise<(string | null)[]> => {
  const client = getRedisClient();
  return await client.mget(keys);
};

// Cache operations (aliases for backward compatibility)
export const setCache = async (key: string, value: string, ttlSeconds?: number): Promise<string> => {
  if (ttlSeconds) {
    return await redisSetex(key, ttlSeconds, value);
  }
  return await redisSet(key, value);
};

export const getCache = async <T = string>(key: string): Promise<T | null> => {
  const result = await redisGet(key);
  return result as T | null;
};

export const deleteCache = async (key: string): Promise<number> => {
  return await redisDel(key);
};

export const existsCache = async (key: string): Promise<boolean> => {
  const result = await redisExists(key);
  return result === 1;
};

export const updateTTL = async (key: string, seconds: number): Promise<number> => {
  return await redisExpire(key, seconds);
};

export const getTTL = async (key: string): Promise<number> => {
  return await redisTtl(key);
};

// Hash operations
export const setHash = async (key: string, field: string, value: string): Promise<number> => {
  const client = getRedisClient();
  return await client.hset(key, field, value);
};

export const getHash = async (key: string, field: string): Promise<string | null> => {
  const client = getRedisClient();
  return await client.hget(key, field);
};

export const getAllHash = async (key: string): Promise<Record<string, string>> => {
  const client = getRedisClient();
  return await client.hgetall(key);
};

// List operations
export const pushToList = async (key: string, ...values: string[]): Promise<number> => {
  const client = getRedisClient();
  return await client.lpush(key, ...values);
};

export const getList = async (key: string, start = 0, stop = -1): Promise<string[]> => {
  const client = getRedisClient();
  return await client.lrange(key, start, stop);
};

// Set operations
export const addToSet = async (key: string, ...members: string[]): Promise<number> => {
  const client = getRedisClient();
  return await client.sadd(key, ...members);
};

export const isMemberOfSet = async (key: string, member: string): Promise<number> => {
  const client = getRedisClient();
  return await client.sismember(key, member);
};

// Sorted set operations
export const addToSortedSet = async (key: string, score: number, member: string): Promise<number> => {
  const client = getRedisClient();
  return await client.zadd(key, score, member);
};

export const getSortedSet = async (key: string, start = 0, stop = -1): Promise<string[]> => {
  const client = getRedisClient();
  return await client.zrange(key, start, stop);
};

// Pub/Sub operations
export const publish = async (channel: string, message: string): Promise<number> => {
  const client = getRedisClient();
  return await client.publish(channel, message);
};

export const subscribe = async (
  client: Redis,
  channel: string,
  callback: (channel: string, message: string) => void
): Promise<string[]> => {
  client.subscribe(channel);
  client.on('message', callback);
  return [channel];
};