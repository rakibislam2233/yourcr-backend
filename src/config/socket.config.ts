import { CorsOptions } from 'cors';

// Socket.IO configuration
export const socketConfig = {
  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  } as CorsOptions,
  
  // Connection settings
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8, // 100 MB
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 45000,
  
  // Security settings
  allowRequest: (req: any, callback: (err: string | null, success: boolean) => void) => {
    const origin = req.headers.origin;
    const allowedOrigins = socketConfig.cors.origin as string[];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback('Origin not allowed', false);
    }
  },
  
  // Room settings
  rooms: {
    maxUsersPerRoom: 100,
    cleanupInterval: 300000, // 5 minutes
  },
  
  // Message settings
  messages: {
    maxMessageLength: 10000,
    rateLimit: {
      maxMessages: 20,
      windowMs: 60000, // 1 minute
    },
  },
};

// Socket event configurations
export const socketEvents = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Authentication events
  AUTHENTICATE: 'authenticate',
  AUTH_SUCCESS: 'auth_success',
  AUTH_FAILED: 'auth_failed',
  
  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  
  // Message events
  MESSAGE: 'message',
  MESSAGE_RECEIVED: 'message_received',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
  
  // User events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  ONLINE_USERS: 'online_users',
  
  // Notification events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification_read',
  
  // System events
  SERVER_READY: 'server_ready',
  SERVER_SHUTDOWN: 'server_shutdown',
};