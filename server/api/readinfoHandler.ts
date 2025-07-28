import type { NextFunction, Request, Response } from 'express'
import PathNotFoundError from '../errors/PathNotFoundError.ts'

export default async function readinfoHandler(req: Request, res: Response, next: NextFunction) {
    const path: string = typeof req.query.path === 'string' ? req.query.path : '/'

    next(new PathNotFoundError(path))
}