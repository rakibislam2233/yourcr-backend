import winston from 'winston';
import path from 'path';
import config from './index';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join('logs', 'error', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: path.join('logs', 'combined', 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Console logging in development
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

export default logger;
