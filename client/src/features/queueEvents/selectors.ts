import { RootState } from '../../store'
import { queueEventAdapter } from './queueEventsSlice'

export const { selectAll } = queueEventAdapter.getSelectors<RootState>(({ queueEvents }) => queueEvents)
