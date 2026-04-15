import http from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import socketRuntime from './src/lib/socketRuntime.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function resolveUserIdFromHandshake(socket) {
  const raw = socket.handshake.query.userId;
  if (Array.isArray(raw)) {
    return raw[0] || null;
  }

  return typeof raw === 'string' ? raw : null;
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  socketRuntime.setSocketServer(io);

  io.on('connection', (socket) => {
    const userId = resolveUserIdFromHandshake(socket);

    if (userId) {
      socket.join(`user:${userId}`);
      socketRuntime.addOnlineUser(socket.id, userId);
    }

    socket.on('presence:ping', (nextUserId) => {
      if (!nextUserId || typeof nextUserId !== 'string') {
        return;
      }

      socket.join(`user:${nextUserId}`);
      socketRuntime.addOnlineUser(socket.id, nextUserId);
    });

    socket.on('disconnect', () => {
      socketRuntime.removeOnlineUser(socket.id);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
