import express from 'express'
import apiErrorHandler from './errorHandler.ts'

import readdirRouter from './readdir/index.ts'
import readinfoRouter from './readinfo/index.ts'

const apiApp = express()

apiApp.use('/readdir', readdirRouter)
apiApp.use('/readinfo', readinfoRouter)

apiApp.use(apiErrorHandler)

export default apiApp
