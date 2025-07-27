#!/usr/bin/env node
import 'dotenv/config'
import parseArgs from 'minimist'
import YDApi from "./api/YDApi.mjs"
import stopWithError from './utils/stopWithError.js'
import path from 'path'
import saveFile from './utils/saveFile.mjs'


const args = parseArgs(process.argv.slice(2))
const TOKEN = args.token || process.env.TOKEN
const FOLDER = args.folder || process.env.FOLDER
const OUTPUT_DIR = args.output_dir || './'
const OUTPUT_FILE = args.output_file || FOLDER?.split('/').reverse()[0] + '.json'
const OUTPUT = path.normalize(`${OUTPUT_DIR}/${OUTPUT_FILE}`)

if (!TOKEN) {
    stopWithError('--token required')
}

if (!FOLDER) {
    stopWithError('--folder required')
}

const ydapi = new YDApi(TOKEN)

console.log(`Load and publish video files from "${FOLDER}"`)

const [files, error] = await ydapi.getVideoFiles(FOLDER)

if (error) {
    stopWithError(error)
}

const pubResult = await ydapi.publishFiles(files)

if (pubResult[1]) {
    stopWithError(pubResult[1])
}

const pubFilesResult = await ydapi.getVideoFiles(FOLDER)

if (pubFilesResult[1]) {
    stopWithError(pubFilesResult[1])
}

saveFile(OUTPUT, JSON.stringify(pubFilesResult[0], 0, 4))

console.log(`Saved file list to "${OUTPUT}"`)