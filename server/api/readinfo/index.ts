import { Router } from 'express'
import getReadinfoHandler from './getReadinfoHandler.ts'

const router = Router()

router.get('/', getReadinfoHandler)

export default router
