const { Sequelize } = require('../lib/db');
const logger = require('../lib/logger');
const User = require('../model/User');

const getAll = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'server error' });
  }
};

const getOne = async (req, res) => {
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

const create = async (req, res) => {
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

const update = async (req, res) => {
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

const destroy = async (req, res) => {
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

module.exports = {
  getAll,
  getOne,
  create,
  update,
  destroy,
};
