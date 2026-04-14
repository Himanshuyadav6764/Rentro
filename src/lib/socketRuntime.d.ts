export function setSocketServer(server: unknown): void;
export function getSocketServer(): unknown;
export function getOnlineUserIds(): string[];
export function addOnlineUser(socketId: string, userId: string): void;
export function removeOnlineUser(socketId: string): void;

export function emitMessageCreated(payload: {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: Date | string;
  seen: boolean;
}): void;

export function emitMessageSeen(payload: {
  senderId: string;
  receiverId: string;
  messageIds: string[];
  seenAt: string;
}): void;
