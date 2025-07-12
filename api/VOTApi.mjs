import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import { makeDirectory } from 'make-dir'
import path from 'node:path'
import isFileExist from '../utils/isFileExist.mjs'

const asyncExec = promisify(exec)

export default class VOTApi {
    static getOutputFileName(fileName, reslang) {
        return `${fileName}--${reslang}`
    }

    static async isFileExist(outputDir, outputFileName, fileExt) {
        const filePath = path.format({ dir: outputDir, name: outputFileName, ext: fileExt })
        return await isFileExist(filePath)
    }

    static async audio(publicUrl, outputDir, fileName, reslang = "ru") {
        const outputFileName = this.getOutputFileName(fileName, reslang)

        if (await this.isFileExist(outputDir, outputFileName, '.mp3')) {
            return
        }

        const { stderr } = await asyncExec(`./node_modules/.bin/vot-cli --reslang="${reslang}" --output="${outputDir}" --output-file="${outputFileName}" ${publicUrl}`)

        if (stderr) {
            throw stderr
        }
    }

    static async sub(publicUrl, outputDir, fileName, reslang = "en") {
        const outputFileName = this.getOutputFileName(fileName, reslang)

        if (await this.isFileExist(outputDir, outputFileName, '.srt')) {
            return
        }

        const { stderr } = await asyncExec(`./node_modules/.bin/vot-cli  --subs-srt --reslang="${reslang}" --output="${outputDir}" --output-file="${outputFileName}" ${publicUrl}`)

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