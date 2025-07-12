#!/usr/bin/env node
import parseArgs from 'minimist'
import stopWithError from './utils/stopWithError.mjs'
import readJsonFile from './utils/readJsonFile.mjs'
import VOTApi from './api/VOTApi.mjs'
import path from 'node:path'

const args = parseArgs(process.argv.slice(2))

const SOURCES = args.sources
const TRANSLATE_DIR = args.traslate_dir || './translate'

if (!SOURCES) {
    stopWithError('--sources required')
}

const files = await readJsonFile(SOURCES)

const named_dir = path.basename(SOURCES, path.extname(SOURCES))
const output_dir = path.normalize(`${TRANSLATE_DIR}/${named_dir}`)

async function translateFile(file) {
    const fileName = path.basename(file.name, path.extname(file.name))
    console.log(`Translate file: ${fileName}`)
    try {
        await VOTApi.translate(file.public_url, output_dir, fileName)
    } catch (error) {
        console.error(error)
    }   
}

for (const file of files) {
    await translateFile(file)
}

