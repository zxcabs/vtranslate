import { RootState } from '../../store.ts'
import { dirEntriesAdapter } from './dirEntriesSlice.ts'

export const { selectAll: selectAllEntries, selectById: selectEntryById } = dirEntriesAdapter.getSelectors<RootState>(
    (state) => state.dirEntries,
)

export const selectDirEntriesStatus = (state: RootState) => state.dirEntries.status
export const selectDirEntriesError = (state: RootState) => state.dirEntries.error
export const selectDirEntriesCurrentPath = (state: RootState) => state.dirEntries.currentPath
