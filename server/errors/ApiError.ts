class ApiError extends Error {
    readonly status: number

    constructor(reason: string, status: number = 500) {
        super(reason)
        this.status = status
    }

    get json() {
        return {
            status: this.status,
            message: this.message,
        }
    }
}

export default ApiError
