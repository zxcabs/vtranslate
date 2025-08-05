import type { Request, Response, NextFunction } from 'express'
import { getResolvedPath } from '../../helpers/path.ts'

export default function resolveSearchPath(req: Request, res: Response, next: NextFunction) {
    const path: string = typeof req.query.path === 'string' ? req.query.path : '/'

    try {
        res.locals.resolvedPath = getResolvedPath(path)
        next()
    } catch (error) {
        next(error)
    }
}
