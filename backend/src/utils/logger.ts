import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logRequest = (req: any, msg: string, meta?: Record<string, any>) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip, ...meta }, msg);
};

export const logError = (err: Error | string, meta?: Record<string, any>) => {
  logger.error(
    {
      err: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      ...meta,
    },
    '❌ Error'
  );
};