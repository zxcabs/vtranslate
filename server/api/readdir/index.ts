import { Router } from 'express'
import readdirHandler from './readdirHandler.ts'
import resolveSearchPath from '../middleware/resolveSearchPath.ts'

const router = Router()

router.get('/', [resolveSearchPath], readdirHandler)

export default router
