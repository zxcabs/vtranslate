import { createAsyncThunk } from '@reduxjs/toolkit'
import { VideoInfo } from '../../../../types/VideoInfo'
import { getJSON } from '../../api'
import { DirEntryFile } from '../../../../types/DirEntry'
import getFullPath from './getFullPath'
import { RootState } from '../../store'
import { selectStatusById } from './selectors'
import { STATUS } from './fileInfoSlice'

export const fetchFileInfo = createAsyncThunk<VideoInfo, DirEntryFile, { rejectValue: string }>(
    'fileInfo/fetchFileInfo',
    async (entry, { rejectWithValue }) => {
        try {
            const path = getFullPath(entry)
            const info = await getJSON<VideoInfo>('readinfo', { path })
            return info
        } catch (error) {
            return rejectWithValue(error.message ?? 'Some error')
        }
    },
)

export const fetchFileInfoIfNeeded = createAsyncThunk<void, DirEntryFile, { state: RootState }>(
    'fileInfo/fetchFileInfoIfNeeded',
    async (entry, { getState, dispatch }) => {
        const status = selectStatusById(getState(), getFullPath(entry))

        if (status === STATUS.LOADING) return

        await dispatch(fetchFileInfo(entry)).unwrap()
    },
)
