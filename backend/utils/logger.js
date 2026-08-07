const nativeConsole = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
  log: console.log.bind(console)
};

function shouldLog(level) {
  if (level === 'debug') {
    return process.env.NODE_ENV === 'development';
  }

  return true;
}

function formatMessage(level, args) {
  const timestamp = new Date().toISOString();
  const message = args.map((arg) => {
    if (typeof arg === 'string') return arg;
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }).join(' ');

  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}

function write(level, ...args) {
  if (!shouldLog(level)) {
    return;
  }

  const output = formatMessage(level, args);

  switch (level) {
    case 'debug':
      nativeConsole.debug(output);
      break;
    case 'info':
      nativeConsole.info(output);
      break;
    case 'warn':
      nativeConsole.warn(output);
      break;
    case 'error':
      nativeConsole.error(output);
      break;
    default:
      nativeConsole.log(output);
  }
}

const logger = {
  debug: (...args) => write('debug', ...args),
  info: (...args) => write('info', ...args),
  warn: (...args) => write('warn', ...args),
  error: (...args) => write('error', ...args),
  log: (...args) => write('info', ...args),
  dir: (...args) => write('debug', ...args)
};

Object.assign(global.console, {
  log: (...args) => logger.info(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
  debug: (...args) => logger.debug(...args),
  dir: (...args) => logger.dir(...args)
});

module.exports = logger;
