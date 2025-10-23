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
            service.events.on(name, this.createQueueEventHandler(service.name, name))
        })

        service.events.on('progress', (data) => {
            this.progressQueueEventHandler(service.name, data)
        })
        service.events.on('failed', (data) => {
            this.failedQueueEventHandler(service.name, data)
        })
    }

    private createQueueEventHandler(serviceName: string, eventName: WSQueueEventsMapNames) {
        return ({ jobId }: { jobId: string }) => {
            this.send({ type: 'queueEvent', service: serviceName, event: eventName, jobId })
        }
    }

    private progressQueueEventHandler(serviceName: string, { jobId, data }: { jobId: string; data: JobProgress }) {
        this.send({ type: 'queueEvent', service: serviceName, event: 'progress', jobId, progress: Number(data) })
    }

    private failedQueueEventHandler(serviceName: string, { jobId, failedReason }: { jobId: string; failedReason: string }) {
        this.send({ type: 'queueEvent', service: serviceName, event: 'failed', jobId, reason: failedReason })
    }

    private send(data: WSQueueEvent) {
        this.wss.send(JSON.stringify(data))
    }
}
