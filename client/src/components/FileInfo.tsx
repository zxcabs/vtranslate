import React, { useState, useEffect } from 'react'
import { type DirEntryFile } from '../../../types/DirEntry.type.ts'
import { getJSON } from '../api.ts'
import { type VideoInfo } from '../../../types/VideoInfo.type.ts'

interface Props {
    entry: DirEntryFile
}

const FileInfo: React.FC<Props> = ({ entry }) => {
    const [info, setInfo] = useState<VideoInfo | null>(null)

    const fetchFileInfo = async (entry: DirEntryFile) => {
        const info = await getJSON<VideoInfo>('readinfo', { path: `${entry.parentPath}/${entry.name}` })

        setInfo(info)
    }

    useEffect(() => {
        fetchFileInfo(entry)
    }, [entry])

    return (
        <div>
            {info ? JSON.stringify(info) : null}
        </div>
    )
}

export default FileInfo