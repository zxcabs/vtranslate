export default class WSC {
    private buff = new Set<string | ArrayBufferLike | Blob | ArrayBufferView>()
    private ws: WebSocket

    constructor(url: string) {
        this.ws = new WebSocket(url)

        this.ws.addEventListener('open', this.openHandler.bind(this))
    }

    private openHandler() {
        if (this.buff.size > 0) {
            this.buff.forEach((data) => {
                this.ws.send(data)
            })

            this.buff.clear()
        }
    }

    addDataHandler<T>(fn: (message: T) => void): () => void {
        const handler = (event: MessageEvent) => {
            let json: JSON | undefined

            try {
                json = JSON.parse(event.data)
            } catch (error) {
                console.error(error)
            }

            if (!json) return

            fn(json as T)
        }

        this.ws.addEventListener('message', handler)

        return () => {
            this.ws.removeEventListener('message', handler)
        }
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data)
        } else {
            this.buff.add(data)
        }
    }
}
