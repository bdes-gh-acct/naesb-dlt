import { transports, createLogger } from 'winston';
import * as httpLogger from 'morgan';
import { env } from '../env';

const { LOG_LEVEL, SERVICE_NAME, CONSOLE_LOG_LEVEL } = env;

export const logger = createLogger({
  level: LOG_LEVEL || 'info',
  defaultMeta: { service: SERVICE_NAME },
  transports: [
    new transports.Console({
      level: CONSOLE_LOG_LEVEL || 'info',
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
