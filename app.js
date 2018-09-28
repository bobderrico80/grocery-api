const express = require('express');
const morgan = require('morgan');
const passport = require('passport');
const { Strategy } = require('passport-jwt');
const router = require('./router');
const { jwtOptions, jwtVerify } = require('./lib/auth');
const { sequelize } = require('./lib/db');
const logger = require('./lib/logger');
const User = require('./model/User');

const port = process.env.PORT || 8080;

const app = express();

// Basic middleware
logger.info('Initializing middleware');
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure authentication
logger.info('Initializing authentication');
passport.use(new Strategy(jwtOptions, jwtVerify(User)));
app.use(passport.initialize());

// Configure routes
logger.info('Initializing routes');
app.use('/', router);

// Bootstrap application
(async () => {
  logger.info('Synchronizing database with models');
  await sequelize.sync({ logging: logger.debug });
  app.listen(port);
  logger.info(`Listening on port ${port}`);
})();
