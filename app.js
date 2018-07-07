const express = require('express');
const Sequelize = require('sequelize');
const packageJson = require('./package.json');
const logger = require('./lib/logger');

const port = process.env.PORT || 8080;

const app = express();
const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_URL, {
  logging: false,
  operatorsAliases: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const router = express.Router();

router.get('/healthcheck', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).send();
  } catch (error) {
    res.status(503).send();
  }
});

router.get('/version', (req, res) => {
  res.status(200).send({ version: packageJson.version });
});

app.use('/', router);

app.listen(port);
logger.info(`Listening on port ${port}`);
