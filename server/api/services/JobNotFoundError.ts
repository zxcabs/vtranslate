import ApiError from '../../errors/ApiError.ts'

export default class JobNotFoundError extends ApiError {
    constructor(serviceName: string = 'Unknown', jobId: string = 'Unknown') {
        super(`Service "${serviceName}" job "${jobId} not found"`, 404)
    }
}
