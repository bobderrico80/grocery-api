const winston = require('winston');

const { combine, simple, colorize } = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
  ],
});

// Logger stream for Morgan request logging
logger.stream = {
  write(message) {
    logger.debug(message.trim());
  },
};

module.exports = logger;
