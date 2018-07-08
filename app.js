const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const packageJson = require('./package.json');
const logger = require('./lib/logger');

const port = process.env.PORT || 8080;

// Database
const sequelize = new Sequelize(process.env.POSTGRES_CONNECTION_URL, {
  logging: logger.debug,
  operatorsAliases: false,
});

// Models
const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  name: { type: Sequelize.STRING, allowNull: false },
});

// Controllers
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

const getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // TODO sanitize error response
      res.status(409).json(error);
      return;
    }

    if (error instanceof Sequelize.ValidationError) {
      // TODO sanitize error response
      res.status(400).json(error);
      return;
    }

    logger.error(error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'not found' });
      return;
    }
    const updatedUser = await user.update({ ...user.toJSON(), ...req.body });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // TODO sanitize error response
      res.status(409).json(error);
      return;
    }

    if (error instanceof Sequelize.ValidationError) {
      // TODO sanitize error response
      res.status(400).json(error);
      return;
    }

    logger.error(error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'not found' });
      return;
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: 'server error' });
  }
};

const app = express();

// Middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
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

router.get('/user', getAllUsers);
router.get('/user/:id', getOneUser);
router.post('/user', createUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

app.use('/', router);

// Bootstrap application
(async () => {
  await sequelize.sync({ logging: logger.debug });
  app.listen(port);
  logger.info(`Listening on port ${port}`);
})();
