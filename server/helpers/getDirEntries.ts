import type { Dirent } from 'node:fs'
import { DirEntryType, type DirEntry } from '../../types/DirEntry.type.ts'
import { readdir } from 'node:fs/promises'
import PathNotFoundError from '../errors/PathNotFoundError.ts'
import { checkPath, resolvePath } from './path.ts'
import mime from 'mime'

export default async function getDirEntries(path: string): Promise<DirEntry[]> {
    const resolvedPath = resolvePath(path)

    if (!checkPath(resolvedPath)) {
        throw new PathNotFoundError(path)
    }

    const dirList: Dirent[] = await readdir(resolvedPath, { withFileTypes: true })

    return dirList.reduce((acc, dirent) => {
        const isDir = dirent.isDirectory()
        const isFile = dirent.isFile()

        if (!isDir && !isFile) {
            return acc
        }

        if (isFile) {
            acc.push({
                parentPath: path,
                name: dirent.name,
                type: DirEntryType.File,
                mime: mime.getType(dirent.name) || 'unknown',
            })
        } else {
            acc.push({
                parentPath: path,
                name: dirent.name,
                type: DirEntryType.Directory,
            })
        }

        return acc
    }, [] as DirEntry[])
}
