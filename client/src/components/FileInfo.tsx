import React, { useEffect } from 'react'
import { type DirEntryFile } from '../../../types/DirEntry'
import { useSelector } from 'react-redux'
import { selectById } from '../features/fileInfo/selectors.ts'
import getFullPath from '../features/fileInfo/getFullPath.ts'
import { RootState } from '../store.ts'
import { useAppDispatch } from '../hooks/useAppDispatch.ts'
import { fetchFileInfoIfNeeded } from '../features/fileInfo/thunks.ts'
import { clearByEntry, STATUS } from '../features/fileInfo/fileInfoSlice.ts'

interface Props {
    entry: DirEntryFile
}

const FileInfo: React.FC<Props> = ({ entry }) => {
    const id = getFullPath(entry)
    const fileInfo = useSelector((state: RootState) => selectById(state, id))
    const dispatch = useAppDispatch()

    useEffect(() => {
        dispatch(fetchFileInfoIfNeeded(entry))

        return () => {
            dispatch(clearByEntry(entry))
        }
    }, [dispatch, entry])

    if (!fileInfo || fileInfo.status === STATUS.LOADING) return <div>loading</div>

    const { status, error, info } = fileInfo
    if (status === STATUS.ERROR) return <div>{error}</div>

    return <div>{JSON.stringify(info, null, 2)}</div>
}

export default FileInfo
