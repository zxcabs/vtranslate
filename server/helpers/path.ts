import { resolve, join, normalize } from 'node:path'
import { VIDEO_DIR } from '../config.ts'
import PathNotFoundError from '../errors/PathNotFoundError.ts'

const BASE_VIDEO_DIR = resolve(VIDEO_DIR)

export function resolvePath(inputPath: string): string {
    const joinedPath = join(BASE_VIDEO_DIR, inputPath)
    return normalize(joinedPath)
}

export function checkResolvedPath(resolvedPath: string): boolean {
    return resolvedPath.startsWith(BASE_VIDEO_DIR)
}

export function getLocalPath(resolvedPath: string): string {
    return resolvedPath.replace(BASE_VIDEO_DIR, '')
}

/**
 * Check path and return resolved path if exists or throw error PathNotFoundError
 * @param {string} path Path
 * @returns {string} Resolved path or throw error PathNotFoundError
 */
export function getResolvedPath(path: string): string {
    const resolvedPath = resolvePath(path)

    if (!checkResolvedPath(resolvedPath)) {
        throw new PathNotFoundError(path)
    }

    return resolvedPath
}
