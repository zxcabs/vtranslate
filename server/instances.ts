import { REDIS_URL, REDIS_CACHE_TTL } from './config.ts'
import RedisClient from './RedisClient.ts'
import FFProbeService from './services/ffProbe/FFProbeService.ts'

export const redisClient = new RedisClient({ url: REDIS_URL, ttl: REDIS_CACHE_TTL })
export const ffProbeService = new FFProbeService({ redis: redisClient })
