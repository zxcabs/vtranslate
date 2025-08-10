import { configureStore } from '@reduxjs/toolkit'
import dirEntriesReducer from './features/dirEntries/dirEntriesSlice'
import fileInfoReducer from './features/fileInfo/fileInfoSlice'

const store = configureStore({
    reducer: {
        dirEntries: dirEntriesReducer,
        fileInfo: fileInfoReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
