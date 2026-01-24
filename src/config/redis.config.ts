import { connectRedis, getRedisClient } from '../utils/redis.utils';

// Initialize and export Redis client
const initializeRedis = async () => {
  return await connectRedis();
};

export { initializeRedis, getRedisClient };
export default initializeRedis;