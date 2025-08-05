import { stat } from 'node:fs/promises'
import type { VideoInfo } from '../../../types/VideoInfo.ts'
import RedisClient from '../../RedisClient.ts'
import PathNotFoundError from '../../errors/PathNotFoundError.ts'
import { type Stats } from 'node:fs'
import ProbeProcessor from './ProbeProcessor.ts'
import getHashString from '../../../utils/hashString.ts'

const DEFAULT_PROCESS_LIMIT = 2

interface FFProbeServiceConstructorOptions {
    processLimit?: number
    redis: RedisClient
}

class FFProbeService {
    private processLimit: number
    protected redis: RedisClient
    protected probeProcessor: ProbeProcessor

    constructor(options: FFProbeServiceConstructorOptions) {
        const { processLimit = DEFAULT_PROCESS_LIMIT, redis } = options ?? {}

        this.redis = redis
        this.probeProcessor = new ProbeProcessor({ redis: redis.redisClient, concurrency: processLimit })
    }

    async getInfo(resolvedPath: string): Promise<VideoInfo> {
        const key = await this.getFileKey(resolvedPath)
        const videoInfoKey = this.getVideoInfoKey(key)
        const fromRedis = await this.redis.getJson<VideoInfo>(videoInfoKey)

        if (fromRedis) {
            return fromRedis
        }

        const fromProbe = await this.runVideoFileProbe(resolvedPath, this.getJobKey(key))

        await this.redis.setJson(videoInfoKey, fromProbe)

        return fromProbe
    }

    private getVideoInfoKey(fileKey: string): string {
        return `videoinfo:${fileKey}`
    }

    private getJobKey(fileKey: string): string {
        return `job:${fileKey}`
    }

    private async getFileStats(resolvedPath: string): Promise<Stats> {
        try {
            return await stat(resolvedPath)
        } catch (error) {
            console.error(error)
            throw new PathNotFoundError(resolvedPath)
        }
    }

    private async getFileKey(resolvedPath: string): Promise<string> {
        const stats = await this.getFileStats(resolvedPath)
        return await getHashString(`${resolvedPath}:${stats.atime.getTime()}`)
    }

    private async runVideoFileProbe(resolvedPath: string, jobKey: string): Promise<VideoInfo> {
        await this.probeProcessor.addJob({ path: resolvedPath }, jobKey)

        return await this.probeProcessor.waitForJobResult(jobKey)
    }
}

export default FFProbeService
