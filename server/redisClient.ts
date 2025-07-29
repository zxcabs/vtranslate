import { createClient, type RedisClientType, type RedisArgument } from 'redis'
import { REDIS_URL, REDIS_CACHE_TTL } from './config.ts'
import type { Json } from '../types/Json.type.ts'

const RECONNECT_MIN_DELAY = 1000
const RECONNECT_MAX_DELAY = 30000
const MAX_RECONNECT_ATTEMPTS = 10

let client: RedisClientType | null = null
let isShuttingDown = false
const reconnectTimeout: NodeJS.Timeout | null = null

export async function connectRedis(): Promise<RedisClientType> {
    if ((client && client.isReady) || client) {
        return client
    }

    client = createClient({
        url: REDIS_URL,
        socket: {
            reconnectStrategy: (retries) => {
                if (isShuttingDown) {
                    return false
                }

                if (retries > MAX_RECONNECT_ATTEMPTS) {
                    console.error('Maximum recconect attempts to Redis')
                    return false
                }

                const delay = Math.min(RECONNECT_MIN_DELAY * Math.pow(2, retries), RECONNECT_MAX_DELAY)
                console.log(`Trying to reconnect to Redis after ${delay} ms (retry: ${retries})`)
                return delay
            },
        },
    })

    client.on('error', (err) => {
        if (!isShuttingDown) {
            console.error('Redis:', err.message)
        }
    })

    client.on('connect', () => {
        if (!isShuttingDown) {
            console.log('Redis connected')
        }
    })

    client.on('reconnecting', () => {
        if (!isShuttingDown) {
            console.log('Reonnecting to Redis...')
        }
    })

    client.on('end', () => {
        console.log('Redis connection closed')
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout)
        }
    })

    try {
        await client.connect()
    } catch (err) {
        console.error('Redis', err)
        throw err
    }

    return client
}

export async function shutdownRedis(): Promise<void> {
    if (isShuttingDown) return
    isShuttingDown = true

    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
    }

    if (client) {
        try {
            await client.quit()
            console.log('Redis disconnect succeseful')
        } catch (err) {
            console.error('Redis on disconnect', err)
        } finally {
            client = null
        }
    }
}

export async function set(key: string, value: RedisArgument, ttl: number = REDIS_CACHE_TTL): Promise<string | null> {
    const redisClient = await connectRedis()

    return await redisClient.set(key, value, { EX: ttl })
}

export async function get(key: string): Promise<string | null> {
    const redisClient = await connectRedis()
    return await redisClient.get(key)
}

export async function setJson<T extends Json>(key: string, value: T, ttl: number = REDIS_CACHE_TTL): Promise<T | null> {
    const str = JSON.stringify(value)
    const result = await set(key, str, ttl)
    return result ? value : null
}

export async function getJson<T extends Json>(key: string): Promise<T | null> {
    const result = await get(key)

    if (!result) {
        return null
    }

    return JSON.parse(result) as T
}
