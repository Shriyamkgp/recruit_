type LogLevel = "debug" | "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, meta?: any) {
  const payload: any = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return JSON.stringify(payload);
}

export const logger = {
  debug: (msg: string, meta?: any) => console.debug(formatMessage("debug", msg, meta)),
  info: (msg: string, meta?: any) => console.info(formatMessage("info", msg, meta)),
  warn: (msg: string, meta?: any) => console.warn(formatMessage("warn", msg, meta)),
  error: (msg: string, meta?: any) => console.error(formatMessage("error", msg, meta)),
};

export default logger;
