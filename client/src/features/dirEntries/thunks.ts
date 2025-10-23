import { createAsyncThunk } from '@reduxjs/toolkit'
import { DirEntry } from '../../../../types/DirEntry'
import { getJSON } from '../../api'
import { RootState } from '../../store'
import { STATUS } from './dirEntriesSlice'

export const fetchEntries = createAsyncThunk<{ path: string; entries: DirEntry[] }, string, { rejectValue: string }>(
    'dirEntries/fetchEntries',
    async (path, { rejectWithValue }) => {
        try {
            const entries = await getJSON<DirEntry[]>('readdir', { path })

            return { path, entries }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    },
)

export const fetchEntriesIfNeeded = createAsyncThunk<void, string, { state: RootState }>(
    'dirEntries/fetchEntriesIfNeeded',
    async (path, { getState, dispatch }) => {
        const { dirEntries } = getState()

        if (dirEntries.status === STATUS.LOADING) return

        await dispatch(fetchEntries(path)).unwrap()
    },
)
