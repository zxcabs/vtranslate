import express from 'express'
import readdirHandler from './readdirHandler.ts'
import apiErrorHandler from './errorHandler.ts'

const apiApp = express()

apiApp.get('/readdir', readdirHandler)

apiApp.use(apiErrorHandler)

export default apiApp
