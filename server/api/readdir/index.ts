import { Router } from 'express'
import readdirHandler from './readdirHandler.ts'

const router = Router()

router.get('/', readdirHandler)

export default router
