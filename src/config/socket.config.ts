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
  transports: ['websocket', 'polling'] as ['websocket', 'polling'],
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
