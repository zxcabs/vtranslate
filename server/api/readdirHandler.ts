import type { NextFunction, Request, Response } from 'express'
import { readdir } from 'node:fs/promises'
import { checkPath, resolvePath } from '../helpers/path.ts'
import PathNotFoundError from './errors/PathNotFoundError.ts'

export default async function readdirHandler(req: Request, res: Response, next: NextFunction) {
    const path: string = typeof req.query.path === 'string' ? req.query.path : '/'
    const resolvedPath = resolvePath(path)

    if (!checkPath(resolvedPath)) {
        return next(new PathNotFoundError(path))
    }

    try {
        const dirList = await readdir(resolvedPath)
        res.json(dirList)
    } catch (error) {
        if (error.code === 'ENOENT') {
            return next(new PathNotFoundError(path))
        }

        next(error)
    }
}