import { stat } from 'node:fs/promises'
import Queue, { type Job } from 'bee-queue'
import type { VideoInfo } from '../../../types/VideoInfo.ts'
import RedisClient from '../../RedisClient.ts'
import PathNotFoundError from '../../errors/PathNotFoundError.ts'
import { type Stats } from 'node:fs'
import { getVideoFileProbe } from '../../helpers/getVideoFileProbe.ts'

const DEFAULT_PROCESS_LIMIT = 2

interface FFProbeQueueJobData {
    path: string
}

interface FFProbeServiceConstructorOptions {
    processLimit?: number
    redis: RedisClient
}

class FFProbeService {
    private processLimit: number
    protected redis: RedisClient
    protected queName: string = 'FFProbeService'
    protected que: Queue

    constructor(options: FFProbeServiceConstructorOptions) {
        const { processLimit = DEFAULT_PROCESS_LIMIT, redis } = options ?? {}

        this.processLimit = processLimit
        this.redis = redis

        this.que = new Queue<FFProbeQueueJobData>(this.queName, { redis: redis.redisClient })
        this.registerQueProcess()
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
        return `jobkey:${fileKey}`
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
        return `${resolvedPath}:${stats.atime.getTime()}`
    }

    private async runVideoFileProbe(resolvedPath: string, jobKey: string): Promise<VideoInfo> {
        let job: Job<FFProbeQueueJobData> | null = await this.que.getJob(jobKey)

        if (!job) {
            job = await this.que.createJob({ path: resolvedPath }).setId(jobKey).save()

            if (!job.id) {
                // job alredy exist
                job = await this.que.getJob(jobKey)
            }
        }

        const result = await this.jobResult<FFProbeQueueJobData, VideoInfo>(job)

        return result
    }

    private registerQueProcess() {
        this.que.process(this.processLimit, async (job: Job<FFProbeQueueJobData>) => {
            const data = job.data
            return await getVideoFileProbe(data.path)
        })
    }

    private async jobResult<T, S>(job: Job<T>): Promise<S> {
        return new Promise((rs, rj) => {
            job.once('succeeded', (result) => rs(result as S))
            job.once('failed', (error) => rj(error))
        })
    }
}

export default FFProbeService
