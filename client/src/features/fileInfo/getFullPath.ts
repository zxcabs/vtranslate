import { DirEntryFile } from '../../../../types/DirEntry'

export default function (entry: DirEntryFile): string {
    return `${entry.path}/${entry.name}`
}
