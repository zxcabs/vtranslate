import type { NextFunction, Request, Response } from 'express'
import { getVideoFileProbe } from '../../helpers/getVideoFileProbe.ts'

export default async function getReadinfoHandler(req: Request, res: Response, next: NextFunction) {
    const path: string = typeof req.query.path === 'string' ? req.query.path : '/'

    try {
        const info = await getVideoFileProbe(path)
        res.json(info)
    } catch (err) {
        next(err)
    }
}
