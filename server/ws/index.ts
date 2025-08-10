import { type Server as HTTPServer } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

const clients: Set<WebSocket> = new Set()
const wss = new WebSocketServer({ noServer: true })

wss.on('connection', (ws: WebSocket, req) => {
    console.log(`Клиент подключился: ${req.socket.remoteAddress}`)

    clients.add(ws)

    ws.send(JSON.stringify({ type: 'welcome', message: `Добро пожаловать! Всего клиентов: ${clients.size}` }))

    ws.on('message', (data: string) => {
        console.log('Получено:', data)

        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'message', from: 'someone', content: data }))
            }
        })
    })

    ws.on('close', () => {
        console.log('Клиент отключился')
        clients.delete(ws)
    })

    ws.onerror = (err) => {
        console.error('Ошибка WebSocket:', err)
        clients.delete(ws)
    }
})

function serverUse(server: HTTPServer) {
    server.on('upgrade', (req, socket, head) => {
        const pathname = req.url

        if (pathname === '/ws') {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req)
            })
        } else {
            socket.destroy()
        }
    })
}

export default serverUse
