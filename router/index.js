const express = require('express');
const requireDir = require('require-dir');
const packageJson = require('../package.json');
const { sequelize } = require('../lib/db');
const logger = require('../lib/logger');

const router = express.Router();

logger.info('Initializing healthcheck route');
router.get('/healthcheck', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(204).send();
  } catch (error) {
    res.status(503).send();
  }
});

logger.info('Initializing version route');
router.get('/version', (req, res) => {
  res.status(200).send({ version: packageJson.version });
});

const routers = requireDir();

Object.entries(routers).forEach(([name, { router: routerFunction, middleware = [] }]) => {
  logger.info(`initializing ${name} routes`);
  router.use(`/${name}`, ...middleware, routerFunction);
});

module.exports = router;
