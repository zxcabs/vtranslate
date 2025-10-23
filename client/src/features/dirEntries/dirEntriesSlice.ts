import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import type { DirEntry } from '../../../../types/DirEntry.ts'
import { fetchEntries } from './thunks.ts'

export const enum STATUS {
    IDLE = 'idle',
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error',
}

const dirEntriesAdapter = createEntityAdapter({ selectId: (entry: DirEntry) => `${entry.path}/${entry.name}` })

interface DirEntriesState {
    status: STATUS
    error: string | null
    currentPath: string
}

const initialState: DirEntriesState & ReturnType<typeof dirEntriesAdapter.getInitialState> =
    dirEntriesAdapter.getInitialState<DirEntriesState>({
        status: STATUS.IDLE,
        error: null,
        currentPath: '/',
    })

const dirEntriesSlice = createSlice({
    name: 'DirEntries',
    initialState,
    reducers: {
        clear: (state) => {
            dirEntriesAdapter.removeAll(state)
            state.currentPath = '/'
            state.status = STATUS.IDLE
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEntries.pending, (state) => {
                state.status = STATUS.LOADING
                state.error = null
            })
            .addCase(fetchEntries.fulfilled, (state, action) => {
                state.status = STATUS.LOADED
                state.currentPath = action.payload.path
                dirEntriesAdapter.setAll(state, action.payload.entries)
            })
            .addCase(fetchEntries.rejected, (state, action) => {
                state.status = STATUS.ERROR
                state.error = action.error.message ?? 'Some error'
            })
    },
})

export default dirEntriesSlice.reducer
export const { clear } = dirEntriesSlice.actions
export { dirEntriesAdapter }
