import appListenerMiddleware from '../appListenerMiddleware/appListenerMiddleware'
import { add, remove } from './queueEventsSlice'

appListenerMiddleware.startListening({
    actionCreator: add,
    effect: async (action, listenerApi) => {
        const payload = action.payload

        if (payload.event !== 'completed') return

        await listenerApi.delay(30000)

        listenerApi.dispatch(remove(payload.jobId))
    },
})
