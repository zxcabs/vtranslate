import { lstat } from 'node:fs/promises'

export default async function getFileSize(path: string): Promise<number> {
    const stat = await lstat(path)

    return stat.size
}
