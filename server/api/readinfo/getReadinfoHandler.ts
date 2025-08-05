import type { NextFunction, Request, Response } from 'express'
import { ffProbeService } from '../../instances.ts'

export default async function getReadinfoHandler(req: Request, res: Response, next: NextFunction) {
    const path: string = res.locals.resolvedPath

    try {
        const info = await ffProbeService.getInfo(path)
        res.json(info)
    } catch (err) {
        next(err)
    }
}
