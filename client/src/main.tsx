import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import store from './store.ts'
import WS from './WSC.ts'
import { WSQueueEvent } from '../../types/WSQueueEvent.ts'
import { add } from './features/queueEvents/queueEventsSlice.ts'

const rootEl = document.getElementById('root')
const ws = new WS('/ws')

ws.addDataHandler<WSQueueEvent>((data) => {
    store.dispatch(add(data))
})

if (rootEl) {
    createRoot(rootEl).render(
        <StrictMode>
            <Provider store={store}>
                <App />
            </Provider>
        </StrictMode>,
    )
}
