import { Job } from 'bullmq'
import { type VideoInfo } from '../../../types/VideoInfo.ts'
import QueueProcessor, { type QueueProcessorOptions } from './QueueProcessor.ts'
import { getVideoFileProbe } from '../../helpers/getVideoFileProbe.ts'

export interface ProbeJobData {
    path: string
}

export default class ProbeProcessor extends QueueProcessor<ProbeJobData, VideoInfo> {
    constructor(options: QueueProcessorOptions) {
        super('probe', options)
    }

    protected async workerProcessor(job: Job<ProbeJobData>): Promise<VideoInfo> {
        const { data } = job
        await job.updateProgress(0)
        const result = await getVideoFileProbe(data.path)
        await job.updateProgress(100)

        return result
    }
}
