const { Sequelize } = require('./db');
const logger = require('./logger');

module.exports = (Model) => {
  const handleMissingResource = (res) => {
    res.status(404).json({ message: 'not found' });
  };

  const handleError = (res, error) => {
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
  };

  const getAll = async (req, res) => {
    try {
      const resources = await Model.findAll();
      res.status(200).json(resources);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'server error' });
    }
  };

  const getOne = async (req, res) => {
    try {
      const resource = await Model.findById(req.params.id);
      if (!resource) {
        handleMissingResource(res);
        return;
      }

      res.status(200).json(resource);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'server error' });
    }
  };

  const create = async (req, res) => {
    try {
      const resource = await Model.create(req.body);
      res.status(201).json(resource);
    } catch (error) {
      handleError(res, error);
    }
  };

  const update = async (req, res) => {
    try {
      const resource = await Model.findById(req.params.id);
      if (!resource) {
        handleMissingResource(res);
        return;
      }

      const updatedModel = await resource.update({ ...resource.toJSON(), ...req.body });
      res.status(200).json(updatedModel);
    } catch (error) {
      handleError(res, error);
    }
  };

  const destroy = async (req, res) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        handleMissingResource(res);
        return;
      }

      await resource.destroy();
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  };

  return {
    getAll,
    getOne,
    create,
    update,
    destroy,
  };
};
