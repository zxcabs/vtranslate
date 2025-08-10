import 'dotenv-defaults/config.js'
import app from './server/index.ts'
import stopWithError from './utils/stopWithError.ts'
import { redisClient } from './server/instances.ts'
import { createServer } from 'node:http'
import serverUse from './server/ws/index.ts'

const PORT: string | undefined = process.env.PORT

let isShuttingDown = false

if (!PORT) {
    stopWithError('PORT is required in ENV variable')
}

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
})

const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']

try {
    await redisClient.connect()
} catch (err) {
    console.error('Cannont connect to redis server.', err, '\nExit')
    process.exit(1)
}

signals.forEach((signal) => {
    process.on(signal, async () => {
        if (isShuttingDown) return
        isShuttingDown = true

        console.log(`\nGet signal${signal}. Shutdown...`)

        server.close(async (err: Error | undefined) => {
            if (err) {
                console.error('HTTPServer:', err.message)
                process.exit(1)
            }

            console.log('HTTPServer stopped')

            try {
                await redisClient.shutdown()
            } catch (err) {
                console.error(err)
            }

            process.exit(0)
        })

        setTimeout(() => {
            console.error('Graceful shutdown limit. Force shutdown.')
            process.exit(1)
        }, 10000)

        process.exit(0)
    })
})

const server = createServer(app)

serverUse(server)

server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} already in use.`)
    } else {
        console.error('HTTPServer error:', err.message)
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
