import type { WSMessage } from './WSMessage.ts'

export type WSQueueEventType = 'queueEvent'
export type WSQueueJobId = string
export type WSQueueServiceName = string
export type WSQueueEventName = 'active' | 'added' | 'cleaned' | 'completed' | 'removed' | 'waiting' | 'progress' | 'failed'

interface WSQueueEventBase extends WSMessage {
    type: WSQueueEventType
    service: WSQueueServiceName
    jobId: WSQueueJobId
    event: WSQueueEventName
}

export interface WSQueueEventJobActive extends WSQueueEventBase {
    event: 'active'
}

export interface WSQueueEventJobAdded extends WSQueueEventBase {
    event: 'added'
}

export interface WSQueueEventJobCleaned extends WSQueueEventBase {
    event: 'cleaned'
}

export interface WSQueueEventJobCompleted extends WSQueueEventBase {
    event: 'completed'
}

export interface WSQueueEventJobRemoved extends WSQueueEventBase {
    event: 'removed'
}

export interface WSQueueEventJobWaiting extends WSQueueEventBase {
    event: 'waiting'
}

export interface WSQueueEventJobProgress extends WSQueueEventBase {
    event: 'progress'
    progress: number
}

export interface WSQueueEventJobFailed extends WSQueueEventBase {
    event: 'failed'
    reason: string
}

export type WSQueueEvent =
    | WSQueueEventJobActive
    | WSQueueEventJobAdded
    | WSQueueEventJobCleaned
    | WSQueueEventJobCompleted
    | WSQueueEventJobRemoved
    | WSQueueEventJobWaiting
    | WSQueueEventJobProgress
    | WSQueueEventJobFailed
