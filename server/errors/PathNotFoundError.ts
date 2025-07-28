import ApiError from "./ApiError.ts"

class PathNotFoundError extends ApiError {
    constructor(path: string) {
        super(`Path "${path}" not found`, 404)
    }
}

export default PathNotFoundError