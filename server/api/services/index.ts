import { Router } from 'express'
import getJobById from './getJobById.ts'
import resolveService from './resolveService.ts'

const router = Router()

router.param('service', resolveService)

router.route('/:service/:jobId').get(getJobById)

export default router
