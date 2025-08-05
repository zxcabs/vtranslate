import fs from 'node:fs'
import normalizeUrl from 'normalize-url'
import getFileSize from '../utils/getFileSize.ts'
import savedAsync from '../utils/savedAsync.ts'
import PathNotFoundError from '../server/errors/PathNotFoundError.ts'
import type { HttBody, HttpHeaders, HttpMethod } from '../types/Http.ts'

interface YDApiContstructorOptions {
    token: string
    chunkSize?: number
}

interface YDApiSearchParams extends Record<string, string | boolean | null | undefined> {
    path?: string
}

interface YDApiDiskResult {
    trash_size: number
    total_space: number
    used_space: number
    max_file_size: number
}

interface YDStatsResult {
    path: string
    type: string
    name: string
    created: string
    modified: string
    size: number
    mime_type: string
    md5: string
    sha256: string
    public_url: string
}

interface YDUploadUrlResult {
    method: string
    href: string
    templated: boolean
    operation_id: string
}

interface YDPublishResult {
    method: string
    href: string
    templated: boolean
}

interface RequestOptions {
    method: HttpMethod
    headers?: HttpHeaders
    body?: HttBody
}

export default class YDApi {
    static readonly YD_API_PREFIX = 'https://cloud-api.yandex.net/v1'
    static DEFAULT_CHUNK_SIZE = 1 * 1024 * 1024

    private chunkSize: number
    private token: string
    private abortController: AbortController

    static sanitizeSearchParams(searchParams?: YDApiSearchParams): Record<string, string> | undefined {
        if (!searchParams) return

        return Object.entries(searchParams).reduce((acc, [key, value]) => {
            if (value === undefined) return acc
            acc[key] = String(value)
            return acc
        }, {})
    }

    constructor({ token, chunkSize = YDApi.DEFAULT_CHUNK_SIZE }: YDApiContstructorOptions) {
        this.token = token
        this.chunkSize = chunkSize
        this.abortController = new AbortController()
    }

    shutdown() {
        this.abortController.abort()
    }

    async disk(): Promise<YDApiDiskResult> {
        const fields = ['total_space', 'used_space', 'trash_size', 'max_file_size'].join(',')
        return await this.createJSONRequest<YDApiDiskResult>('/disk', { fields })
    }

    async uploadFile(filePath: string, yaFilePath: string) {
        const fileSize = await getFileSize(filePath)
        const [ydStats, ydStatsError] = await savedAsync(this.getStats(yaFilePath))

        let writeFileSize = 0

        if (!ydStatsError) {
            writeFileSize = ydStats.size
        }

        if (writeFileSize === fileSize) {
            return
        }

        const { href: uploadUrl } = await this.createJSONRequest<YDUploadUrlResult>('/disk/resources/upload', {
            path: yaFilePath,
            overwrite: 'false',
        })
        const readStream = fs.createReadStream(filePath, {
            start: writeFileSize,
            highWaterMark: this.chunkSize,
            signal: this.abortController.signal,
        })

        for await (const chunk of readStream) {
            if (this.abortController.signal.aborted) return

            const endSize = writeFileSize + chunk.length - 1

            await this.makeRequest(
                uploadUrl,
                'PUT',
                {
                    'Content-Type': 'application/octet-stream',
                    'Content-Range': `bytes ${writeFileSize}-${endSize}/${fileSize}`,
                },
                chunk,
            )

            writeFileSize += chunk.length
            const progress = Number((writeFileSize / fileSize) * 100).toFixed(2)

            console.log(`progress: ${progress}`)
        }
    }

    async publish(yaFilePath: string): Promise<YDPublishResult> {
        return await this.createJSONRequest<YDPublishResult>('/disk/resources/publish', { path: yaFilePath }, { method: 'PUT' })
    }

    async getStats(yaFilePath: string): Promise<YDStatsResult> {
        const fields = ['path', 'type', 'name', 'created', 'modified', 'size', 'media_type', 'md5', 'sha256', 'public_url'].join(',')
        return await this.createJSONRequest<YDStatsResult>('/disk/resources', { path: yaFilePath, fields })
    }

    async removeFile(yaFilePath: string, options?: { permanently?: boolean; md5?: string }) {
        return await this.createRequest(
            '/disk/resources',
            { path: yaFilePath, permanently: options?.permanently, md5: options?.md5 },
            { method: 'DELETE' },
        )
    }

    private async makeRequest(url: string, method: HttpMethod = 'GET', headers?: HttpHeaders, body?: HttBody) {
        const response = await fetch(normalizeUrl(url), {
            signal: this.abortController.signal,
            method: method,
            headers: {
                ...(headers ? headers : {}),
                Authorization: `OAuth ${this.token}`,
            },
            body,
        })

        if (response.status === 404) {
            throw new PathNotFoundError(url)
        } else if (!response.ok) {
            throw new Error(`Responce error status: ${response.status}`)
        }

        return response
    }

    private async createRequest(path: string, searchParam?: YDApiSearchParams, options: RequestOptions = { method: 'GET' }) {
        const searhString = new URLSearchParams(YDApi.sanitizeSearchParams(searchParam))
        return await this.makeRequest(
            `${YDApi.YD_API_PREFIX}/${path}/${searhString ? '?' + searhString : ''}`,
            options.method,
            options?.headers,
            options?.body,
        )
    }

    private async createJSONRequest<T>(
        path: string,
        searchParam?: YDApiSearchParams,
        options: RequestOptions = { method: 'GET' },
    ): Promise<T> {
        const response = await this.createRequest(path, searchParam, {
            ...options,
            headers: {
                ...(options?.headers ?? {}),
                'Content-Type': 'application/json',
            },
        })

        return (await response.json()) as T
    }
}
