import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../utils/logger';

// Socket event names
export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  MESSAGE: 'message',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  ONLINE_USERS: 'online-users',
  USER_CONNECTED: 'user-connected',
  USER_DISCONNECTED: 'user-disconnected',
  NOTIFICATION: 'notification',
} as const;

// Socket rooms
export const SOCKET_ROOMS = {
  GLOBAL: 'global',
  USER_PREFIX: 'user_',
  NOTIFICATIONS: 'notifications',
} as const;

// Active users map
const activeUsers = new Map<string, { socketId: string; userId: string; timestamp: number }>();

export const setupSocket = (io: SocketIOServer) => {
  logger.info('Setting up Socket.IO handlers...');

  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Handle user joining with authentication
    socket.on('authenticate', (data: { userId: string; token: string }) => {
      try {
        // Here you would verify the token
        const { userId } = data;
        
        // Add user to active users
        activeUsers.set(socket.id, {
          socketId: socket.id,
          userId,
          timestamp: Date.now(),
        });

        // Join user's personal room
        socket.join(`${SOCKET_ROOMS.USER_PREFIX}${userId}`);
        
        // Emit to all clients that user is online
        socket.broadcast.emit(SOCKET_EVENTS.USER_CONNECTED, { userId });
        
        // Send current online users
        socket.emit(SOCKET_EVENTS.ONLINE_USERS, {
          users: Array.from(activeUsers.values()).map(u => u.userId),
          count: activeUsers.size,
        });

        logger.info(`User authenticated: ${userId} (${socket.id})`);
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.disconnect();
      }
    });

    // Handle joining rooms
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room: string) => {
      socket.join(room);
      logger.info(`Socket ${socket.id} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room: string) => {
      socket.leave(room);
      logger.info(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle messaging
    socket.on(SOCKET_EVENTS.MESSAGE, (data: { room: string; message: string; senderId: string }) => {
      socket.to(data.room).emit(SOCKET_EVENTS.MESSAGE, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle typing indicators
    socket.on(SOCKET_EVENTS.TYPING, (data: { room: string; userId: string }) => {
      socket.to(data.room).emit(SOCKET_EVENTS.TYPING, data);
    });

    socket.on(SOCKET_EVENTS.STOP_TYPING, (data: { room: string; userId: string }) => {
      socket.to(data.room).emit(SOCKET_EVENTS.STOP_TYPING, data);
    });

    // Handle notifications
    socket.on('send-notification', (data: { userId: string; notification: any }) => {
      const userRoom = `${SOCKET_ROOMS.USER_PREFIX}${data.userId}`;
      socket.to(userRoom).emit(SOCKET_EVENTS.NOTIFICATION, data.notification);
    });

    // Handle disconnection
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      const userData = activeUsers.get(socket.id);
      if (userData) {
        activeUsers.delete(socket.id);
        socket.broadcast.emit(SOCKET_EVENTS.USER_DISCONNECTED, { userId: userData.userId });
        logger.info(`User disconnected: ${userData.userId} (${socket.id})`);
      } else {
        logger.info(`Anonymous user disconnected: ${socket.id}`);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = Date.now();
    const staleThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [socketId, userData] of activeUsers.entries()) {
      if (now - userData.timestamp > staleThreshold) {
        activeUsers.delete(socketId);
        logger.info(`Removed stale user: ${userData.userId}`);
      }
    }
  }, 10 * 60 * 1000); // Run every 10 minutes

  logger.info('Socket.IO handlers setup completed');
};

// Helper functions
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
  const room = `${SOCKET_ROOMS.USER_PREFIX}${userId}`;
  io.to(room).emit(event, data);
};

export const emitToRoom = (io: SocketIOServer, room: string, event: string, data: any) => {
  io.to(room).emit(event, data);
};

export const getOnlineUsers = () => {
  return {
    users: Array.from(activeUsers.values()).map(u => u.userId),
    count: activeUsers.size,
  };
};