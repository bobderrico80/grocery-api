const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./lib/db');
const logger = require('./lib/logger');
const router = require('./router');

const port = process.env.PORT || 8080;

const app = express();

// Middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', router);

// Bootstrap application
(async () => {
  logger.info('Syncronizing database with models');
  await sequelize.sync({ logging: logger.debug });
  app.listen(port);
  logger.info(`Listening on port ${port}`);
})();
