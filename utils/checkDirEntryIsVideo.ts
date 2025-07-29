import { type DirEntry, DirEntryType } from '../types/DirEntry.type'
import checkMimeIsVideo from './checkMimeIsVideo'

export default function checkDirEntryIsVideo(entry: DirEntry): boolean {
    return entry.type === DirEntryType.File && checkMimeIsVideo(entry.mime)
}
