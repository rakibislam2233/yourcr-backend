import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config/index';

const { combine, timestamp, label, printf, errors, colorize } = winston.format;

const myFormat = printf(info => {
  const { level, message, label, timestamp, stack } = info;
  const date = new Date(timestamp as string);
  const hour = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

  const formattedMessage = `${formattedDate} ${hour}:${minutes}:${seconds} [${label}] ${level.toUpperCase()}: ${message}`;
  return stack ? `${formattedMessage}\n${stack}` : formattedMessage;
});

// Daily Rotate File Transport for Success/Info logs
const successTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'success', 'success-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'info',
  format: combine(label({ label: 'YourCR-Backend' }), timestamp(), myFormat),
});

// Daily Rotate File Transport for Error logs
const errorTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'errors', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d', // Automatically delete logs older than 7 days
  level: 'error',
  format: combine(label({ label: 'YourCR-Backend' }), timestamp(), errors({ stack: true }), myFormat),
});

// Console Transport with enhanced formatting
const consoleTransport = new winston.transports.Console({
  format: combine(
    label({ label: 'YourCR' }),
    timestamp(),
    colorize(),
    printf(info => {
      const { level, message, label, timestamp } = info;
      const date = new Date(timestamp as string);
      const hour = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      // Color coding based on log level
      let levelColor = '';
      switch(level.toLowerCase()) {
        case 'error':
          levelColor = '\x1b[31m'; // Red
          break;
        case 'warn':
          levelColor = '\x1b[33m'; // Yellow
          break;
        case 'info':
          levelColor = '\x1b[32m'; // Green
          break;
        case 'debug':
          levelColor = '\x1b[36m'; // Cyan
          break;
        default:
          levelColor = '\x1b[37m'; // White
      }

      const resetColor = '\x1b[0m';
      return `${levelColor}${formattedDate} ${hour}:${minutes}:${seconds} [${label}] ${level.toUpperCase()}: ${resetColor}${message}`;
    })
  ),
});

const logger = winston.createLogger({
  level: config.logging.level || 'info',
  format: combine(label({ label: 'YourCR-Backend' }), timestamp(), myFormat),
  transports: [successTransport, consoleTransport, errorTransport],
});

// Console logging in development with enhanced formatting
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => {
          const { level, message, timestamp } = info;
          const date = new Date(timestamp as string);
          const hour = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const seconds = date.getSeconds().toString().padStart(2, '0');

          // Enhanced visual formatting for development
          const levelColors: { [key: string]: string } = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[32m',  // Green
            debug: '\x1b[36m', // Cyan
            verbose: '\x1b[35m',// Magenta
            silly: '\x1b[37m',  // White
          };

          const color = levelColors[level] || '\x1b[37m';
          const reset = '\x1b[0m';

          return `${color}[${hour}:${minutes}:${seconds}] ${level.toUpperCase().padEnd(7)}${reset} ${message}`;
        })
      ),
    })
  );
}

export default logger;
