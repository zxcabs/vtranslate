export const STATIC_DIR: string = process.env.STATIC_DIR ?? './client/dist'
export const VIDEO_DIR: string = process.env.VIDEO_DIR ?? './video'
export const REDIS_URL: string = process.env.REDIS_URL ?? 'redis://localhost:6379'
export const REDIS_CACHE_TTL: number = process.env.REDIS_CACHE_TTL ? parseInt(process.env.REDIS_CACHE_TTL, 10) : 60 * 60 * 24
