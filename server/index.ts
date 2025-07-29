import express from 'express'
import api from './api/index.ts'
import { STATIC_DIR } from './config.ts'

const app = express()

if (STATIC_DIR) {
    app.use(express.static(STATIC_DIR))
}

app.use('/api', api)

export default app
