/**
 * signalingServer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Minimal WebSocket relay server for WebRTC signaling.
 * No paid service — self-host for free on Railway, Render, or Fly.io.
 *
 * Setup:
 *   npm install ws
 *   node signalingServer.js
 *
 * Production:
 *   Set PORT env var, run behind nginx with wss:// (TLS).
 * ─────────────────────────────────────────────────────────────────────────────
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

/** userId → WebSocket */
const clients = new Map();

wss.on('listening', () => {
  console.log(`[Signaling] Listening on ws://0.0.0.0:${PORT}`);
});

wss.on('connection', ws => {
  let myId = null;

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case 'register':
        myId = msg.from;
        clients.set(myId, ws);
        ws.send(JSON.stringify({ type: 'registered', userId: myId }));
        console.log(`[+] ${myId}  (total: ${clients.size})`);
        break;

      case 'call':
      case 'answer':
      case 'ice':
      case 'hangup':
      case 'busy':
        relay(msg);
        break;
    }
  });

  ws.on('close', () => {
    if (myId) {
      clients.delete(myId);
      console.log(`[-] ${myId}  (total: ${clients.size})`);
    }
  });

  ws.on('error', err => console.error('[Signaling] error', err));
});

function relay(msg) {
  const target = clients.get(msg.to);
  if (!target || target.readyState !== WebSocket.OPEN) {
    console.warn(`[Signaling] ${msg.to} not found`);
    return;
  }
  // Rename 'call' → 'incoming' so the client can distinguish push vs self-sent
  const out = msg.type === 'call' ? { ...msg, type: 'incoming' } : msg;
  target.send(JSON.stringify(out));
}
