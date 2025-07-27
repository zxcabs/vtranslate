import 'dotenv-defaults/config.js'
import app from './server/index.ts'
import stopWithError from './utils/stopWithError.ts'

const PORT: string | undefined = process.env.PORT

if (!PORT) {
    stopWithError('PORT is required in ENV variable')
}

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
})

app.listen(PORT, (error) => {
    if (error) {
        console.error(error.message)
    } else {
        console.log(`Server is running on http://localhost:${PORT}`)
    }
});

