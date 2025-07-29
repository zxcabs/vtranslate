import type { Dirent } from 'node:fs'
import { readdir } from 'node:fs/promises'
import mime from 'mime'
import { DirEntryType, type DirEntry } from '../../types/DirEntry.ts'
import { getLocalPath } from './path.ts'

export default async function getDirEntries(resolvedPath: string): Promise<DirEntry[]> {
    const localPath = getLocalPath(resolvedPath)

    const dirList: Dirent[] = await readdir(resolvedPath, { withFileTypes: true })

    return dirList.reduce((acc, dirent) => {
        const isDir = dirent.isDirectory()
        const isFile = dirent.isFile()

        if (!isDir && !isFile) {
            return acc
        }

        if (isFile) {
            acc.push({
                path: localPath,
                name: dirent.name,
                type: DirEntryType.File,
                mime: mime.getType(dirent.name) || 'unknown',
            })
        } else {
            acc.push({
                path: localPath,
                name: dirent.name,
                type: DirEntryType.Directory,
            })
        }

        return acc
    }, [] as DirEntry[])
}
