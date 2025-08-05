import { promisify } from 'node:util'
import { exec } from 'node:child_process'
import path from 'node:path'
import { makeDirectory } from 'make-dir'
import isFileExist from '../utils/isFileExist.mjs'

const asyncExec = promisify(exec)

export default class FFApi {
    static async translate(file, translateDir, outputDir) {
        const fileName = path.basename(file)
        const baseName = path.basename(fileName, path.extname(fileName))
        const outputFile = path.normalize(`${outputDir}/${fileName}`)
        const audioFile = path.normalize(`${translateDir}/${baseName}--ru.mp3`)
        const subEnFile = path.normalize(`${translateDir}/${baseName}--en.srt`)
        const subRuFile = path.normalize(`${translateDir}/${baseName}--ru.srt`)

        makeDirectory(outputDir)

        if (await isFileExist(outputFile)) {
            return
        }

        const cmd = `ffmpeg -i "${file}" -i "${audioFile}" -i "${subEnFile}" -i "${subRuFile}"\
            -map 0:v -map 1:a -map 0:a  -map 2 -map 3 \
            -c:v copy -c:a aac -b:a 192k -c:s mov_text \
            -disposition:a:0 default -disposition:a:1 none \
            -metadata:s:a:0 language=rus -metadata:s:a:1 language=eng \
            -metadata:s:s:0 language=eng -metadata:s:s:1 language=rus \
            -movflags +faststart \
            "${outputFile}"`

        await asyncExec(cmd)
    }
}
