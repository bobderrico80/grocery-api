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

module.exports = logger;
