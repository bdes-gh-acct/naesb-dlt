import { transports, createLogger } from 'winston';
import httpLogger from 'morgan';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: process.env.SERVICE_NAME },
  transports: [
    new transports.File({
      level: process.env.LOG_LEVEL || 'info',
      filename: process.env.LOG_PATH || './logs/all-logs.log',
      handleExceptions: true,
      maxsize: 524288, // 0.5MB
      maxFiles: 5,
    }),
    new transports.Console({
      level: process.env.CONSOLE_LOG_LEVEL || 'info',
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

const mapToMeta = (message: string) => {
  const params = message.split(' ');
  const date = params[0].trim();
  const method = params[1].trim();
  const url = params[2].trim();
  const status = params[3].trim();
  const contentLength = Number(params[4].trim());
  const responseTime = `${params[5].trim()}ms`;
  const userAgent = params[7].trim();
  return {
    date,
    method,
    url,
    status,
    contentLength,
    responseTime,
    userAgent,
  };
};

export const httpLoggerMiddleware = httpLogger(
  (tokens, req, res) =>
    [
      tokens.date(req, res, 'iso'),
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      tokens['response-time'](req, res),
      'ms',
      tokens['user-agent'](req, res),
    ].join(' '),
  {
    stream: { write: (message) => logger.http(message, mapToMeta(message)) },
  },
);
