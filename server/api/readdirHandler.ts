import type { NextFunction, Request, Response } from 'express'
import PathNotFoundError from '../errors/PathNotFoundError.ts'
import { type DirEntry } from '../../types/DirEntry.type.ts'
import getDirEntries from '../helpers/getDirEntries.ts'

export default async function readdirHandler(req: Request, res: Response, next: NextFunction) {
    const path: string = typeof req.query.path === 'string' ? req.query.path : '/'

    try {
        const dirListResponce: DirEntry[] = await getDirEntries(path)
        res.json(dirListResponce)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return next(new PathNotFoundError(path))
        }

        next(error)
    }
}