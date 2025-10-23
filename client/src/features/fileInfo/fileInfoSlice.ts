import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VideoInfo } from '../../../../types/VideoInfo'
import { fetchFileInfo } from './thunks'
import getFullPath from './getFullPath'
import { DirEntryFile } from '../../../../types/DirEntry'

export const enum STATUS {
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error',
}

interface FileInfo {
    id: string
    status: STATUS
    error?: string
    info?: VideoInfo
}

const fileInfoAdapter = createEntityAdapter<FileInfo>()

const fileInfoSlice = createSlice({
    name: 'FileInfo',
    initialState: fileInfoAdapter.getInitialState(),
    reducers: {
        clearByEntry: (state, action: PayloadAction<DirEntryFile>) => {
            fileInfoAdapter.removeOne(state, getFullPath(action.payload))
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFileInfo.pending, (state, action) => {
                fileInfoAdapter.addOne(state, {
                    id: getFullPath(action.meta.arg),
                    status: STATUS.LOADING,
                })
            })
            .addCase(fetchFileInfo.fulfilled, (state, action) => {
                fileInfoAdapter.upsertOne(state, {
                    id: getFullPath(action.meta.arg),
                    status: STATUS.LOADED,
                    info: action.payload,
                })
            })
            .addCase(fetchFileInfo.rejected, (state, action) => {
                fileInfoAdapter.upsertOne(state, {
                    id: getFullPath(action.meta.arg),
                    status: STATUS.ERROR,
                    error: action.error.message ?? 'Some error',
                })
            })
    },
})

export default fileInfoSlice.reducer
export const { clearByEntry } = fileInfoSlice.actions
export { fileInfoAdapter }
