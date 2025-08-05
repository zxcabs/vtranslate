import { Router } from 'express'
import getReadinfoHandler from './getReadinfoHandler.ts'
import resolveSearchPath from '../middleware/resolveSearchPath.ts'

const router = Router()

router.get('/', [resolveSearchPath], getReadinfoHandler)

export default router
