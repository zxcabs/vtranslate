import { createAsyncThunk } from '@reduxjs/toolkit'
import { Job } from 'bullmq'
import { WSQueueEvent } from '../../../../types/WSQueueEvent'
import { getJSON } from '../../api'
import { RootState } from '../../store'
import { selectById } from './selectors'

export const fetchJob = createAsyncThunk<Job, WSQueueEvent>('jobs/fetchJob', async (queEvent) => {
    return await getJSON(`services/${queEvent.service}/${queEvent.jobId}`)
})

export const fetchJobIfNeeded = createAsyncThunk<void, WSQueueEvent, { state: RootState }>(
    'jobs/fetchJobIfNeeded',
    async (queEvent, { getState, dispatch }) => {
        const isAlreadyHave = selectById(getState(), queEvent.jobId)

        if (!isAlreadyHave) {
            dispatch(fetchJob(queEvent)).unwrap()
        }
    },
)
