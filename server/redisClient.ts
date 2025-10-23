import Redis from 'ioredis'

const RECONNECT_MIN_DELAY = 1000
const RECONNECT_MAX_DELAY = 30000
const MAX_RECONNECT_ATTEMPTS = 10
const DEFAULT_URL = 'redis://localhost:6379'
const DEFAULT_TTL = 60 * 60 * 24

interface RedisClientConstructorOptions {
    url?: string
    ttl?: number
    reconnectMinDelay?: number
    reconnectMaxDelay?: number
    maxRecconectAttempts?: number
}

export default class RedisClient {
    protected isShuttingDown: boolean = false
    protected client: Redis
    protected ttl: number = 0

    constructor(options?: RedisClientConstructorOptions) {
        const {
            reconnectMinDelay = RECONNECT_MIN_DELAY,
            reconnectMaxDelay = RECONNECT_MAX_DELAY,
            maxRecconectAttempts = MAX_RECONNECT_ATTEMPTS,
            url = DEFAULT_URL,
            ttl = DEFAULT_TTL,
        } = options ?? {}

        this.ttl = ttl

        this.client = new Redis(url, {
            maxRetriesPerRequest: null,
            retryStrategy: (retries: number) => {
                if (this.isShuttingDown) {
                    return null
                }

                if (retries > maxRecconectAttempts) {
                    console.error('Maximum reconnect attempts to Redis reached')
                    return null
                }

                const delay = Math.min(reconnectMinDelay * Math.pow(2, retries), reconnectMaxDelay)
                console.log(`Trying to reconnect to Redis after ${delay} ms (retry: ${retries})`)
                return delay
            },
            reconnectOnError: (err: Error): boolean | 1 => {
                const target = err.message
                if (target.includes('AUTH')) {
                    return false
                }

                return true
            },
        })

        this.client.on('error', (err) => {
            if (!this.isShuttingDown) {
                console.error('Redis error:', err.message)
            }
        })

        this.client.on('connect', () => {
            if (!this.isShuttingDown) {
                console.log('Redis connected')
            }
        })

        this.client.on('reconnecting', () => {
            if (!this.isShuttingDown) {
                console.log('Reconnecting to Redis...')
            }
        })

        this.client.on('end', () => {
            console.log('Redis connection closed')
        })
    }

    async connect(): Promise<this> {
        if (this.isShuttingDown) {
            throw new Error('Cannot connect: Redis client is shutting down')
        }

        if (this.client?.status === 'connect' || this.client?.status === 'connecting' || this.client?.status === 'ready') {
            return this
        }

        try {
            await this.client?.connect()
        } catch (err) {
            console.error('Failed to connect to Redis:', err)
            throw err
        }

        return this
    }

    async shutdown(): Promise<this> {
        if (this.isShuttingDown) return this
        this.isShuttingDown = true

        if (this.client) {
            try {
                await this.client.quit()
                console.log('Redis disconnected successfully')
            } catch (err) {
                console.error('Error during Redis disconnect:', err)
            }
        }

        return this
    }

    async set(key: string, value: string, ttl?: number): Promise<this> {
        await this.connect()

        if (!this.client) {
            throw new Error('Redis client is not available')
        }

        await this.client.set(key, value, 'EX', ttl ?? this.ttl)
        return this
    }

    async get(key: string): Promise<string | null> {
        await this.connect()

        if (!this.client) {
            throw new Error('Redis client is not available')
        }

        return await this.client.get(key)
    }

    async del(key: string): Promise<number> {
        await this.connect()

        if (!this.client) {
            throw new Error('Redis client is not available')
        }

        return await this.client.del(key)
    }

    async setJson<T>(key: string, value: T, ttl?: number): Promise<this> {
        const str = JSON.stringify(value)
        await this.set(key, str, ttl)
        return this
    }

    async getJson<T>(key: string): Promise<T | null> {
        const result = await this.get(key)

        if (!result) {
            return null
        }

        try {
            return JSON.parse(result) as T
        } catch (err) {
            console.error('Failed to parse JSON from Redis:', err)
            return null
        }
    }

    get redisClient(): Redis {
        return this.client
    }
}
