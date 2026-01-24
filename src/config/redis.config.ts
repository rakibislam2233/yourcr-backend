import { RedisService } from '../services/redis.service';

// Export Redis client instance
const redisClient = RedisService.initialize();

// Export for backward compatibility
export { RedisService };
export default redisClient;