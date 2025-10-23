import { RootState } from '../../store'
import { JobAdapter } from './JobsSlice'

export const { selectById } = JobAdapter.getSelectors<RootState>((state) => state.jobs)
