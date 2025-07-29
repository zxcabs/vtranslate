import { resolve, join, normalize } from 'node:path'
import { VIDEO_DIR } from '../config.ts'

const BASE_VIDEO_DIR = resolve(VIDEO_DIR)

export function resolvePath(inputPath: string): string {
    const joinedPath = join(BASE_VIDEO_DIR, inputPath)
    return normalize(joinedPath)
}

export function checkPath(resolvedPath: string): boolean {
    return resolvedPath.startsWith(BASE_VIDEO_DIR)
}
