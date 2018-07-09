const Sequelize = require('sequelize');
const logger = require('./logger');

logger.info('Initializing database connection');
const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_URL, {
  logging: logger.debug,
  operatorsAliases: false,
});

module.exports = { sequelize, Sequelize };
