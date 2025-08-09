import fs from 'node:fs'
import EventEmitter from 'node:events'
import getFileSize from '../../utils/getFileSize.ts'

interface YDUploaderConstructorOptions {
    filePath: string
    uploadUrl: string
    chunkSize?: number
}

export default class YDUploader extends EventEmitter {
    static DEFAULT_CHUNK_SIZE = 1 * 1024 * 1024

    readonly chunkSize: number
    readonly filePath: string
    readonly uploadUrl: string

    private currentFileSize: number = 0
    private currentOffset: number = 0
    private currentProggress: number = 0
    private abortController: AbortController = new AbortController()

    constructor({ filePath, uploadUrl, chunkSize = YDUploader.DEFAULT_CHUNK_SIZE }: YDUploaderConstructorOptions) {
        super()
        this.filePath = filePath
        this.uploadUrl = uploadUrl
        this.chunkSize = chunkSize
    }

    async upload(offset: number = 0) {
        const fileSize = (this.currentFileSize = await getFileSize(this.filePath))

        this.emit('uploading')

        const readStream = fs.createReadStream(this.filePath, {
            start: offset,
            highWaterMark: this.chunkSize,
            signal: this.abortController.signal,
        })

        this.calcProgress(offset)
        this.emitProgress()

        for await (const chunk of readStream) {
            if (this.abortController.signal.aborted) return

            const endSize = offset + chunk.length - 1

            await fetch(this.uploadUrl, {
                signal: this.abortController.signal,
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Range': `bytes ${offset}-${endSize}/${fileSize}`,
                },
                body: chunk,
            })

            offset += chunk.length

            this.calcProgress(offset)
            this.emitProgress()
        }
    }

    private calcProgress(offset: number) {
        this.currentOffset = offset
        this.currentProggress = (offset / this.currentFileSize) * 100
    }

    private emitProgress() {
        this.emit('progress', { progress: this.currentProggress, offset: this.currentOffset, size: this.currentFileSize })
    }

    abort() {
        this.emit('abort')
        this.abortController.abort()
    }
}
