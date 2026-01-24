import Redis from 'ioredis';
import { logger } from '../config/logger.config';
import config from '../config';

export class RedisService {
  private static client: Redis | null = null;

  // Initialize Redis connection
  static async connect(): Promise<Redis> {
    if (this.client) {
      return this.client;
    }

    this.client = new Redis({
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
    this.client.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    this.client.on('ready', () => {
      logger.info('✅ Redis ready');
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis error:', error);
    });

    this.client.on('close', () => {
      logger.warn('⚠️ Redis disconnected');
    });

    this.client.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });

    return this.client;
  }

  // Get Redis client instance
  static getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  // Close Redis connection
  static async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      logger.info('✅ Redis connection closed');
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return false;
    }
  }

  // Core Redis operations
  static async setex(key: string, seconds: number, value: string): Promise<string> {
    const client = this.getClient();
    return await client.setex(key, seconds, value);
  }

  static async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.get(key);
  }

  static async del(key: string): Promise<number> {
    const client = this.getClient();
    return await client.del(key);
  }

  static async exists(key: string): Promise<number> {
    const client = this.getClient();
    return await client.exists(key);
  }

  static async set(key: string, value: string): Promise<string> {
    const client = this.getClient();
    return await client.set(key, value);
  }

  static async incr(key: string): Promise<number> {
    const client = this.getClient();
    return await client.incr(key);
  }

  static async decr(key: string): Promise<number> {
    const client = this.getClient();
    return await client.decr(key);
  }

  static async expire(key: string, seconds: number): Promise<number> {
    const client = this.getClient();
    return await client.expire(key, seconds);
  }

  static async ttl(key: string): Promise<number> {
    const client = this.getClient();
    return await client.ttl(key);
  }

  static async mset(data: Record<string, string>): Promise<string> {
    const client = this.getClient();
    const keyValueArray: string[] = [];
    Object.entries(data).forEach(([key, value]) => {
      keyValueArray.push(key, value);
    });
    return await client.mset(keyValueArray);
  }

  static async mget(keys: string[]): Promise<(string | null)[]> {
    const client = this.getClient();
    return await client.mget(keys);
  }

  // Cache operations (aliases for backward compatibility)
  static async setCache(key: string, value: string, ttlSeconds?: number): Promise<string> {
    if (ttlSeconds) {
      return await this.setex(key, ttlSeconds, value);
    }
    return await this.set(key, value);
  }

  static async getCache<T = string>(key: string): Promise<T | null> {
    const result = await this.get(key);
    return result as T | null;
  }

  static async deleteCache(key: string): Promise<number> {
    return await this.del(key);
  }

  static async existsCache(key: string): Promise<boolean> {
    const result = await this.exists(key);
    return result === 1;
  }

  static async updateTTL(key: string, seconds: number): Promise<number> {
    return await this.expire(key, seconds);
  }

  static async getTTL(key: string): Promise<number> {
    return await this.ttl(key);
  }

  // Hash operations
  static async setHash(key: string, field: string, value: string): Promise<number> {
    const client = this.getClient();
    return await client.hset(key, field, value);
  }

  static async getHash(key: string, field: string): Promise<string | null> {
    const client = this.getClient();
    return await client.hget(key, field);
  }

  static async getAllHash(key: string): Promise<Record<string, string>> {
    const client = this.getClient();
    return await client.hgetall(key);
  }

  // List operations
  static async pushToList(key: string, ...values: string[]): Promise<number> {
    const client = this.getClient();
    return await client.lpush(key, ...values);
  }

  static async getList(key: string, start = 0, stop = -1): Promise<string[]> {
    const client = this.getClient();
    return await client.lrange(key, start, stop);
  }

  // Set operations
  static async addToSet(key: string, ...members: string[]): Promise<number> {
    const client = this.getClient();
    return await client.sadd(key, ...members);
  }

  static async isMemberOfSet(key: string, member: string): Promise<number> {
    const client = this.getClient();
    return await client.sismember(key, member);
  }

  // Sorted set operations
  static async addToSortedSet(key: string, score: number, member: string): Promise<number> {
    const client = this.getClient();
    return await client.zadd(key, score, member);
  }

  static async getSortedSet(key: string, start = 0, stop = -1): Promise<string[]> {
    const client = this.getClient();
    return await client.zrange(key, start, stop);
  }

  // Pub/Sub operations
  static async publish(channel: string, message: string): Promise<number> {
    const client = this.getClient();
    return await client.publish(channel, message);
  }

  static async subscribe(
    client: Redis,
    channel: string,
    callback: (channel: string, message: string) => void
  ): Promise<string[]> {
    client.subscribe(channel);
    client.on('message', callback);
    return [channel];
  }
}

// Export singleton instance
export const redisService = new RedisService();