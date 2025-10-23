import type { NextFunction, Response } from 'express'
import { ffProbeService } from '../../instances.ts'
import JobNotFoundError from './JobNotfoundError.ts'
import { type JobRequest } from './types.ts'

export default function resolveService(req: JobRequest, res: Response, next: NextFunction, serviceName: string) {
    if (serviceName === 'probe') {
        req.service = ffProbeService
        next()
    } else {
        next(new JobNotFoundError(serviceName, res.locals.jobId))
    }
}
