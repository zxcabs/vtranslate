import type { NextFunction, Response } from 'express'
import JobNotFoundError from './JobNotfoundError.ts'
import { type JobRequest } from './types.ts'

export default async function (req: JobRequest, res: Response, next: NextFunction) {
    const jobId = req.params.jobId
    const serviceName = req.params.serviceName
    const service = req.service

    const job = await service?.processor.getJob(jobId)

    if (!job) return next(new JobNotFoundError(serviceName, jobId))

    res.send(job)
}
