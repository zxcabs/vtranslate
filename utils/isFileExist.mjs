import { lstat } from 'node:fs/promises'

export default async function isFileExist(filePath) {
    try {
        const fileStat = await lstat(filePath)

        return !!fileStat
    } catch (error) {
        return error.code !== 'ENOENT'
    }
}
