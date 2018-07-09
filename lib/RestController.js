const Sequelize = require('sequelize');
const logger = require('./logger');

module.exports = (Model) => {
  const handleMissingResource = (res) => {
    res.status(404);
    res.json({ message: 'not found' });
  };

  const handleError = (res, error) => {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // TODO sanitize error response
      res.status(409);
      res.json(error);
      return;
    }

    if (error instanceof Sequelize.ValidationError) {
      // TODO sanitize error response
      res.status(400);
      res.json(error);
      return;
    }

    logger.error(error.message);
    res.status(500);
    res.json({ message: 'server error' });
  };

  const getAll = async (req, res) => {
    try {
      const resources = await Model.findAll();
      res.status(200);
      res.json(resources);
    } catch (error) {
      handleError(res, error);
    }
  };

  const getOne = async (req, res) => {
    try {
      const resource = await Model.findById(req.params.id);
      if (!resource) {
        handleMissingResource(res);
        return;
      }

      res.status(200);
      res.json(resource);
    } catch (error) {
      handleError(res, error);
      logger.error(error);
    }
  };

  const create = async (req, res) => {
    try {
      const resource = await Model.create(req.body);
      res.status(201);
      res.json(resource);
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
      res.status(200);
      res.json(updatedModel);
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
      res.status(204);
      res.send();
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
