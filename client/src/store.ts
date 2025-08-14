import { configureStore } from '@reduxjs/toolkit'
import dirEntriesReducer from './features/dirEntries/dirEntriesSlice'
import fileInfoReducer from './features/fileInfo/fileInfoSlice'
import queueEventsReducer from './features/queueEvents/queueEventsSlice'
import appListenerMiddleware from './features/appListenerMiddleware/appListenerMiddleware'
import './features/queueEvents/queueEventsListeners'

const store = configureStore({
    reducer: {
        dirEntries: dirEntriesReducer,
        fileInfo: fileInfoReducer,
        queueEvents: queueEventsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(appListenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
