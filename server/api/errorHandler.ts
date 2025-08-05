import type { ErrorRequestHandler } from 'express'
import ApiError from '../errors/ApiError.ts'

const apiErrorHandler: ErrorRequestHandler = (err, req, res) => {
    if (err instanceof ApiError) {
        res.status(err.status).json(err.json)
        return
    }

    res.status(500).json({
        message: (err as Error)?.message ?? 'Internal Server Error',
        status: 500,
    })
}

export default apiErrorHandler
