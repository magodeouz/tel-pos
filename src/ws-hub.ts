import { DurableObject } from 'cloudflare:workers'

export class CallHub extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // WebSocket upgrade — browser connects here
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)
      this.ctx.acceptWebSocket(server)
      return new Response(null, { status: 101, webSocket: client })
    }

    // Broadcast — APK call triggers this
    if (url.pathname.endsWith('/broadcast') && request.method === 'POST') {
      const data = await request.json()
      const sessions = this.ctx.getWebSockets()
      const msg = JSON.stringify(data)
      for (const ws of sessions) {
        try { ws.send(msg) } catch { /* client disconnected */ }
      }
      return Response.json({ ok: true, sent: sessions.length })
    }

    return new Response('Not found', { status: 404 })
  }

  webSocketMessage(_ws: WebSocket, _msg: string | ArrayBuffer) {}
  webSocketClose(_ws: WebSocket) {}
  webSocketError(_ws: WebSocket, _error: unknown) {}
}
