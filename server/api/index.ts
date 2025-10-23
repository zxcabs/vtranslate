import express from 'express'
import apiErrorHandler from './errorHandler.ts'

import readdirRouter from './readdir/index.ts'
import readinfoRouter from './readinfo/index.ts'
import servicesRouter from './services/index.ts'

const apiApp = express()

apiApp.use('/readdir', readdirRouter)
apiApp.use('/readinfo', readinfoRouter)
apiApp.use('/services', servicesRouter)

apiApp.use(apiErrorHandler)

export default apiApp
