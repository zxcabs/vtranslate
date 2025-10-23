import { type Server as HTTPServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

export default class WSS {
    private clients: Set<WebSocket> = new Set()
    private wss: WebSocketServer

    constructor(server: HTTPServer, path: string = '/ws') {
        this.wss = new WebSocketServer({ server, path })

        this.wss.on('connection', (ws: WebSocket) => {
            this.clients.add(ws)

            ws.on('message', (data: string) => {
                console.log('WSS message:', data)
            })

            ws.on('close', () => {
                this.clients.delete(ws)
            })

            ws.onerror = (err) => {
                console.error('WSS:', err)
                this.clients.delete(ws)
            }
        })
    }

    send(str: string) {
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(str)
            }
        })
    }

    sendJson(json: JSON) {
        this.send(JSON.stringify(json))
    }
}
