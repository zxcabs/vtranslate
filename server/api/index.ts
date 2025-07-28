import express from 'express'
import readdirHandler from './readdirHandler.ts'
import apiErrorHandler from './errorHandler.ts'
import readinfoHandler from './readinfoHandler.ts'

const apiApp = express()

apiApp.get('/readdir', readdirHandler)
apiApp.get('/readinfo', readinfoHandler)

apiApp.use(apiErrorHandler)

export default apiApp
