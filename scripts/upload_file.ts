#!/usr/bin/env node
import parseArgs from 'minimist'
import WebDAVYApi from '../tools/YDApi.ts'
import { basename } from 'node:path'

const args = parseArgs(process.argv.slice(2))
const TOKEN = args.token || process.env.TOKEN
const YADIR = '/_test_upload'
const FILE_PATH = './video/Understanding AFR/01. Introduction/02. What is AFR.mp4'
const YA_FILE_PATH = `${YADIR}/${basename(FILE_PATH)}`

const webdevApi = new WebDAVYApi({ token: TOKEN })

console.log('Disk: ', await webdevApi.disk())
console.log('uploadFile: ', await webdevApi.uploadFile(FILE_PATH, YA_FILE_PATH))
//. console.log('publishFile: ', await webdevApi.publishFile(YA_FILE_PATH))
//. console.log('getYdFileStats: ', await webdevApi.getYdFileStats(YA_FILE_PATH))
//. console.log('removeFile :', await webdevApi.removeFile(YA_FILE_PATH))
