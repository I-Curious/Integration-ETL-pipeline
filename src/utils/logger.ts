enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
  }
  
  function log(level: LogLevel, message: string, meta?: unknown) {
    const timestamp = new Date().toISOString();
    const base = `[${timestamp}] [${level}] ${message}`;
  
    if (meta) {
      console.log(base, meta);
    } else {
      console.log(base);
    }
  }
  
  export const Logger = {
    info: (msg: string, meta?: unknown) => log(LogLevel.INFO, msg, meta),
    warn: (msg: string, meta?: unknown) => log(LogLevel.WARN, msg, meta),
    error: (msg: string, meta?: unknown) => log(LogLevel.ERROR, msg, meta),
    debug: (msg: string, meta?: unknown) => log(LogLevel.DEBUG, msg, meta)
  };
  