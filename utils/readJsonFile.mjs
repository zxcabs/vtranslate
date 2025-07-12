import { readFile } from 'node:fs/promises'

export default async function readJsonFile(path) {
    const data = await readFile(path, 'utf-8')
    return JSON.parse(data)
}