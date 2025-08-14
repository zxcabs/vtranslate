import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { WSQueueEvent } from '../../../../types/WSQueueEvent'

const queueEventAdapter = createEntityAdapter({
    selectId: (event: WSQueueEvent) => event.jobId,
})

const queueEventsSlice = createSlice({
    name: 'queueEventsSlice',
    initialState: queueEventAdapter.getInitialState(),
    reducers: {
        add: (state, action: PayloadAction<WSQueueEvent>) => {
            queueEventAdapter.upsertOne(state, action.payload)
        },
        remove: (state, action: PayloadAction<string>) => {
            queueEventAdapter.removeOne(state, action.payload)
        },
    },
})

export default queueEventsSlice.reducer
export const { add, remove } = queueEventsSlice.actions
export { queueEventAdapter }
