import { Job } from 'bullmq'
import { WSQueueJobId } from '../../../../types/WSQueueEvent'
import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchJob } from './thunks'

interface JobEntity {
    id: WSQueueJobId
    job?: Job
}

export const JobAdapter = createEntityAdapter<JobEntity>()

const JobsSlice = createSlice({
    name: 'Jobs',
    initialState: JobAdapter.getInitialState(),
    reducers: {
        clear: (state) => JobAdapter.removeAll(state),
        removeById: (state, action: PayloadAction<WSQueueJobId>) => JobAdapter.removeOne(state, action.payload),
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchJob.pending, (state, action) => {
                JobAdapter.addOne(state, {
                    id: action.meta.arg.jobId,
                })
            })
            .addCase(fetchJob.fulfilled, (state, action) => {
                JobAdapter.upsertOne(state, {
                    id: action.meta.arg.jobId,
                    job: action.payload,
                })
            })
            .addCase(fetchJob.rejected, (state, action) => {
                JobAdapter.removeOne(state, action.meta.arg.jobId)
            })
    },
})

export default JobsSlice.reducer
