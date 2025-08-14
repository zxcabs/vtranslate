import { Job, Queue, Worker, QueueEvents } from 'bullmq'
import Redis from 'ioredis'

export abstract class BaseQueueProcessor {
    readonly name: string
    protected que: Queue
    protected worker: Worker
    protected queEvents: QueueEvents

    constructor(name: string) {
        this.name = name
    }

    get queue(): Queue {
        return this.que
    }

    get events(): QueueEvents {
        return this.queEvents
    }
}

export interface QueueProcessorOptions {
    redis: Redis
    concurrency?: number
    autorun?: boolean
    removeOnComplete?: number | boolean
    removeOnFail?: number | boolean
    waitJobTimeout?: number
}

export default abstract class QueueProcessor<JD, JR> extends BaseQueueProcessor {
    protected readonly options: QueueProcessorOptions

    constructor(name: string, options: QueueProcessorOptions) {
        super(name)
        const { redis, concurrency = 1, autorun = true, removeOnComplete = 1000, removeOnFail = 1000, waitJobTimeout = 60000 } = options

        this.options = { redis, concurrency, autorun, removeOnComplete, removeOnFail, waitJobTimeout }

        this.createQue(redis)
        this.createEvents(redis)
        this.createWorker(redis)
    }

    private createQue(redis: Redis) {
        this.que = new Queue(this.name, {
            connection: redis,
        })
    }

    private createEvents(redis: Redis) {
        this.queEvents = new QueueEvents(this.name, {
            connection: redis,
        })
    }

    private createWorker(redis: Redis) {
        this.worker = new Worker(this.name, this.workerProcessor.bind(this), {
            connection: redis,
            concurrency: this.options.concurrency,
            autorun: this.options.autorun,
        })

        this.worker.on('error', (err) => {
            console.error(`[BullMQ] Worker "${this.name}" error:`, err)
        })

        this.worker.on('completed', (job) => {
            console.log(`[BullMQ] Job "${this.name}"."${job.id}" completed`)
        })

        this.worker.on('active', (job) => {
            console.log(`[BullMQ] Job "${this.name}"."${job.id}" active`)
        })

        this.worker.on('failed', (error) => {
            console.log(`[BullMQ] "${this.name}" failed: ${error}`)
        })

        this.worker.on('progress', (job) => {
            console.log(`[BullMQ] Job "${this.name}"."${job.id}" progress: ${job.progress}`)
        })
    }

    protected abstract workerProcessor(job: Job<JD>): Promise<JR>

    async addJob(data: JD, jobId?: string): Promise<Job<JD>> {
        const job = await this.que.add(this.name, data, {
            jobId,
            removeOnComplete: this.options.removeOnComplete,
            removeOnFail: this.options.removeOnFail,
        })

        return job as Job<JD>
    }

    async getJob(id: string): Promise<Job<JD> | null> {
        const job = await this.que.getJob(id)

        return (job as Job<JD>) || null
    }

    async waitForJobResult(jobId: string): Promise<JR> {
        const job = await this.que.getJob(jobId)

        if (!job) throw new Error(`Job ${jobId} not found`)

        try {
            const result = await job.waitUntilFinished(this.queEvents, this.options.waitJobTimeout)
            return result as JR
        } catch (err) {
            throw new Error(`Job ${jobId} failed or timeout: ${err.message}`)
        }
    }

    async shutdown(): Promise<void> {
        await this.que.close()
        await this.worker.close()
        await this.queEvents.close()

        console.log(`[Queue] Processor "${this.name}" shutdown complete`)
    }
}
