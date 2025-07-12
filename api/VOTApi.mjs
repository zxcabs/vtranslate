import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import { makeDirectory } from 'make-dir'

const asyncExec = promisify(exec)

export default class VOTApi {
    static async audio(publicUrl, outputDir, fileName, reslang = "ru") {
        const { stderr } = await asyncExec(`./node_modules/.bin/vot-cli --reslang="${reslang}" --output="${outputDir}" --output-file="${fileName}--${reslang}" ${publicUrl}`)

        if (stderr) {
            throw stderr
        }
    }

    static async sub(publicUrl, outputDir, fileName, reslang = "en") {
        const { stderr } = await asyncExec(`./node_modules/.bin/vot-cli  --subs-srt --reslang="${reslang}" --output="${outputDir}" --output-file="${fileName}--${reslang}" ${publicUrl}`)

        if (stderr) {
            throw stderr
        }
    }

    static async translate(publicUrl, outputDir, fileName) {
        await makeDirectory(outputDir)

        await this.audio(publicUrl, outputDir, fileName, 'ru')
        await this.sub(publicUrl, outputDir, fileName, 'en')
        await this.sub(publicUrl, outputDir, fileName, 'ru')

    }
} 