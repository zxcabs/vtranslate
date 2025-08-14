import type { JobProgress } from 'bullmq'
import type { WSQueueEvent } from '../../types/WSQueueEvent.ts'
import { BaseQueueProcessor } from '../services/ffProbe/QueueProcessor.ts'
import WSS from './WSS.ts'

type WSQueueEventsMapNames = 'active' | 'added' | 'cleaned' | 'completed' | 'removed' | 'waiting'

export default class WSServiceBridge {
    static readonly listenQueueEvents: WSQueueEventsMapNames[] = ['active', 'added', 'cleaned', 'completed', 'removed', 'waiting']

    private wss: WSS
    private serviceMap: Set<BaseQueueProcessor> = new Set()

    constructor(wss: WSS) {
        this.wss = wss
    }

    addService(processor: BaseQueueProcessor) {
        if (this.serviceMap.has(processor)) {
            return
        }

        this.serviceMap.add(processor)
        this.setServiceEventHandlers(processor)
    }

    private setServiceEventHandlers(service: BaseQueueProcessor) {
        WSServiceBridge.listenQueueEvents.map((name) => {
            service.events.on(name, this.createQueueEventHandler(name))
        })

        service.events.on('progress', this.progressQueueEventHandler.bind(this))
        service.events.on('failed', this.failedQueueEventHandler.bind(this))
    }

    private createQueueEventHandler(eventName: WSQueueEventsMapNames) {
        return ({ jobId }: { jobId: string }) => {
            this.send({ type: 'queueEvent', event: eventName, jobId })
        }
    }

    private progressQueueEventHandler({ jobId, data }: { jobId: string; data: JobProgress }) {
        this.send({ type: 'queueEvent', event: 'progress', jobId, progress: Number(data) })
    }

    private failedQueueEventHandler({ jobId, failedReason }: { jobId: string; failedReason: string }) {
        this.send({ type: 'queueEvent', event: 'failed', jobId, reason: failedReason })
    }

    private send(data: WSQueueEvent) {
        this.wss.send(JSON.stringify(data))
    }
}
