import { Server as SocketIOServer } from 'socket.io';
import { SOCKET_EVENTS } from './socket.events';

let ioInstance: SocketIOServer | null = null;

export const setSocketInstance = (io: SocketIOServer) => {
  ioInstance = io;
};

export const emitNotificationToUser = (userId: string, notification: any) => {
  if (!ioInstance) return;
  ioInstance.to(`user_${userId}`).emit(SOCKET_EVENTS.NOTIFICATION, notification);
};
