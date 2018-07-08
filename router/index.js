const express = require('express');
const requireDir = require('require-dir');
const packageJson = require('../package.json');
const { sequelize } = require('../lib/db');

const router = express.Router();

router.get('/healthcheck', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(204).send();
  } catch (error) {
    res.status(503).send();
  }
});

router.get('/version', (req, res) => {
  res.status(200).send({ version: packageJson.version });
});

const routers = requireDir();

Object.entries(routers).forEach(([name, routerFunction]) => {
  router.use(`/${name}`, routerFunction);
});

module.exports = router;
