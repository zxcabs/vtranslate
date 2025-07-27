#!/usr/bin/env node
import parseArgs from 'minimist'
import path from 'node:path'
import stopWithError from './utils/stopWithError.js'
import readJsonFile from './utils/readJsonFile.mjs'
import FFApi from './api/FFApi.mjs'

const args = parseArgs(process.argv.slice(2))

const SOURCES = args.sources
const DISK_DIR = args.disk_dir
const TRANSLATE_DIR = args.translate_dir
const OUTPUT_DIR = args.outpit || './output_video'

if (!SOURCES) {
    stopWithError('--sources required')
}

if (!DISK_DIR) {
    stopWithError('--disk_dir required')
}

if (!TRANSLATE_DIR) {
    stopWithError('--traslate_dir required')
}

const files = await readJsonFile(SOURCES)
const named_dir = path.basename(SOURCES, path.extname(SOURCES))
const output_dir = path.normalize(`${OUTPUT_DIR}/${named_dir}/`)

async function translate(file) {
    const filePath = path.normalize(file.path.replace('disk:', DISK_DIR))
    console.log(`Translate file: ${filePath}`)

    await FFApi.translate(filePath, TRANSLATE_DIR, output_dir)
}

for (const file of files) {
    await translate(file)
}
