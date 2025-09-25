const { Server } = require('socket.io');

let ioInstance = null;

function initSocket(server) {
  if (ioInstance) return ioInstance;
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: false
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  return ioInstance;
}

module.exports = { initSocket, getIO };
