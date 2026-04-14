let io = null;

const socketToUser = new Map();
const onlineUsers = new Set();

function setSocketServer(server) {
  io = server;
}

function getSocketServer() {
  return io;
}

function getOnlineUserIds() {
  return Array.from(onlineUsers);
}

function broadcastPresence() {
  if (!io) {
    return;
  }

  io.emit('presence:online-users', getOnlineUserIds());
}

function addOnlineUser(socketId, userId) {
  if (!userId) {
    return;
  }

  socketToUser.set(socketId, userId);
  onlineUsers.add(userId);
  broadcastPresence();
}

function removeOnlineUser(socketId) {
  const userId = socketToUser.get(socketId);
  if (!userId) {
    return;
  }

  socketToUser.delete(socketId);

  const stillOnline = Array.from(socketToUser.values()).some((activeUserId) => activeUserId === userId);
  if (!stillOnline) {
    onlineUsers.delete(userId);
  }

  broadcastPresence();
}

function emitMessageCreated(payload) {
  if (!io) {
    return;
  }

  io.to(`user:${payload.senderId}`).emit('message:new', payload);
  io.to(`user:${payload.receiverId}`).emit('message:new', payload);
}

function emitMessageSeen(payload) {
  if (!io) {
    return;
  }

  io.to(`user:${payload.senderId}`).emit('message:seen', payload);
  io.to(`user:${payload.receiverId}`).emit('message:seen', payload);
}

module.exports = {
  setSocketServer,
  getSocketServer,
  getOnlineUserIds,
  addOnlineUser,
  removeOnlineUser,
  emitMessageCreated,
  emitMessageSeen,
};
