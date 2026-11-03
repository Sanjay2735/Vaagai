import { EventEmitter } from 'events';

class RealtimeBroadcaster extends EventEmitter {}

export const realtimeEmitter = new RealtimeBroadcaster();

// Increase max listeners for multiple simultaneous admin sessions
realtimeEmitter.setMaxListeners(50);

// Active SSE client connections
const sseClients = new Set();

/**
 * Register an SSE client connection
 */
export function addSseClient(res, adminUser) {
  const client = { res, adminUser, connectedAt: new Date() };
  sseClients.add(client);

  console.log(`📡 [Realtime SSE]: Admin "${adminUser.name}" connected. (Active: ${sseClients.size})`);

  // Send initial handshake
  res.write(`event: handshake\ndata: ${JSON.stringify({
    status: 'connected',
    time: new Date().toISOString(),
    user: adminUser.name,
    role: adminUser.role,
  })}\n\n`);

  res.on('close', () => {
    sseClients.delete(client);
    console.log(`🔌 [Realtime SSE]: Admin "${adminUser.name}" disconnected. (Active: ${sseClients.size})`);
  });
}

/**
 * Broadcast an event to all connected admin clients
 * @param {string} type - Event type (e.g. 'order:created', 'inventory:adjusted')
 * @param {object} payload - Event data payload
 */
export function broadcastAdminEvent(type, payload = {}) {
  const message = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  const dataStr = `event: ${type}\ndata: ${JSON.stringify(message)}\n\n`;

  for (const client of sseClients) {
    try {
      client.res.write(dataStr);
    } catch (err) {
      console.error('[SSE Send Error]:', err.message);
      sseClients.delete(client);
    }
  }

  // Also emit locally for internal event handlers
  realtimeEmitter.emit(type, payload);
}

// Heartbeat ping every 25 seconds to prevent browser/proxy timeouts
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(`event: ping\ndata: ${JSON.stringify({ ping: Date.now() })}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000);

export default {
  realtimeEmitter,
  addSseClient,
  broadcastAdminEvent,
};

