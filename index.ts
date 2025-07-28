import 'dotenv-defaults/config.js'
import app from './server/index.ts'
import stopWithError from './utils/stopWithError.ts'
import { connectRedis, shutdownRedis } from './server/redisClient.ts'

const PORT: string | undefined = process.env.PORT

let server
let isShuttingDown = false


if (!PORT) {
    stopWithError('PORT is required in ENV variable')
}

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
})

const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT']

try {
    await connectRedis()
} catch (err) {
    console.error('Cannont connect to redis server. Exit')
    process.exit(1)
}

signals.forEach((signal) => {
    process.on(signal, async () => {
        if (isShuttingDown) return
        isShuttingDown = true

        console.log(`\nGet signal${signal}. Shutdown...`)

        server.close(async (err: Error) => {
            if (err) {
                console.error('HTTPServer:', err)
                process.exit(1)
            }

            console.log('HTTPServer stopped')

            try {
                await shutdownRedis()
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

server = app.listen(PORT, (error) => {
    if (error) {
        console.error(error.message)
    } else {
        console.log(`Server is running on http://localhost:${PORT}`)
    }
})

