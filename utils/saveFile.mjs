import { makeDirectory } from 'make-dir'
import path from 'path'
import { writeFile } from 'node:fs/promises'

export default async function saveFile(filePath, dataStr) {
    const dir = path.dirname(filePath)

    await makeDirectory(dir)
    await writeFile(filePath, dataStr)
}
