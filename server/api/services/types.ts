import type { Request } from 'express'
import type FFProbeService from '../../services/ffProbe/FFProbeService.ts'

type GeneralService = FFProbeService

export interface JobRequest extends Request {
    service?: GeneralService
}
