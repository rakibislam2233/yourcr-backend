export const SOCKET_EVENTS = {
  // Connection Events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  CONNECT_TIMEOUT: 'connect_timeout',
  
  // Room Events
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_JOINED: 'room-joined',
  ROOM_LEFT: 'room-left',
  
  // Message Events
  MESSAGE: 'message',
  MESSAGE_RECEIVED: 'message-received',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_READ: 'message-read',
  
  // Typing Events
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  
  // User Events
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  USER_CONNECTED: 'user-connected',
  USER_DISCONNECTED: 'user-disconnected',
  ONLINE_USERS: 'online-users',
  
  // Authentication Events
  AUTHENTICATE: 'authenticate',
  AUTH_SUCCESS: 'auth-success',
  AUTH_FAILED: 'auth-failed',
  
  // Notification Events
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification-read',
  NOTIFICATION_DISMISSED: 'notification-dismissed',
  
  // File Events
  FILE_UPLOAD_START: 'file-upload-start',
  FILE_UPLOAD_PROGRESS: 'file-upload-progress',
  FILE_UPLOAD_COMPLETE: 'file-upload-complete',
  FILE_UPLOAD_ERROR: 'file-upload-error',
  
  // System Events
  SERVER_READY: 'server-ready',
  SERVER_SHUTDOWN: 'server-shutdown',
  MAINTENANCE_MODE: 'maintenance-mode',
  
  // Custom Events
  CUSTOM_EVENT: 'custom-event',
} as const;

export const SOCKET_ROOMS = {
  GLOBAL: 'global',
  USER_PREFIX: 'user_',
  CHAT_PREFIX: 'chat_',
  NOTIFICATIONS: 'notifications',
  ADMIN: 'admin',
  SUPPORT: 'support',
} as const;

export const SOCKET_ERRORS = {
  UNAUTHORIZED: 'unauthorized',
  INVALID_TOKEN: 'invalid_token',
  USER_NOT_FOUND: 'user_not_found',
  ROOM_NOT_FOUND: 'room_not_found',
  MESSAGE_TOO_LONG: 'message_too_long',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
} as const;