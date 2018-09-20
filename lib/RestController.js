/**
 * A module defining a controller for standard REST endpoints for the given resource model.
 * @module RestController
 */
const NotFoundError = require('./NotFoundError');
const RestRequest = require('./RestRequest');

/**
 * @typedef {object} RestControllerOptions Configuration options for the REST controller.
 * @property {(data: any, req: Request, res: Response) => object} [responseDataFilter] (Optional) If
 * provided, this function will be called before every response, allowing response data to be
 * filtered. The function takes the data to be returned in the response, the Express request object,
 * and the Express response object, and should return the data to be returned in the response.
 */

/**
 * Creates the REST controller for the given model
 * @param {object} Model The Sequelize Model object.
 * @param {RestControllerOptions} [options] Configuration {@link RestControllerOptions options} for
 * the REST controller.
 */
module.exports = (Model, options = {}) => {
  /**
   * Finds all of the resource, responding with a 200 status code and the resources, or with
   * an appropriate status code and response body on error.
   * @param {Request} req The Express request object
   * @param {Response} res The Express response object
   */
  const getAll = async (req, res) => {
    const request = new RestRequest(req, res, options);

    try {
      const resources = await Model.findAll();
      request.withData(resources);
    } catch (error) {
      request.withError(error);
    } finally {
      request.respond();
    }
  };

  /**
   * Finds one resource by ID, using the `:id` URL parameter. Responds with a 200 status code and
   * the resource if found, a 404 if not found, or with an appropriate status code and response body
   * on error.
   * @param {Request} req The Express request object
   * @param {Response} res The Express response object
   */
  const getOne = async (req, res) => {
    const request = new RestRequest(req, res, options);

    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        throw new NotFoundError(`Resource with ID ${req.params.id} could not be found`);
      }

      request.withData(resource);
    } catch (error) {
      request.withError(error);
    } finally {
      request.respond();
    }
  };

  /**
   * Creates a new resource using the data found in the request body. Responds with a 201 status
   * code and the newly-created resource, or with an appropriate status code and response body on
   * error.
   * @param {Request} req The Express request object
   * @param {Response} res The Express response object
   */
  const create = async (req, res) => {
    const request = new RestRequest(req, res, options);

    try {
      const resource = await Model.create(req.body);
      request.withStatus(201).withData(resource);
    } catch (error) {
      request.withError(error);
    } finally {
      request.respond();
    }
  };

  /**
   * Updates an existing resource using the data found in the request body. The existing object will
   * first be found using the `:id` URL parameter, and all supplied properties in the request body
   * will be updated. If the existing object cannot be found, a 404 response will be returned.
   * Responds with a 201 status code and the newly-created resource on a successful update, or with
   * an appropriate status code and response body on error.
   * @param {Request} req The Express request object
   * @param {Response} res The Express response object
   */
  const update = async (req, res) => {
    const request = new RestRequest(req, res, options);

    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        throw new NotFoundError(`Resource with ID ${req.params.id} could not be found`);
      }

      const updatedResource = await resource.update({ ...resource.toJSON(), ...req.body });
      request.withData(updatedResource);
    } catch (error) {
      request.withError(error);
    } finally {
      request.respond();
    }
  };

  /**
   * Deletes an existing resource. The existing object will first be found using the `:id` URL
   * parameter. If the existing object cannot be found, a 404 response will be returned.
   * Responds with a 204 status code a successful delete, or with an appropriate status code and
   * response body on error.
   * @param {Request} req The Express request object
   * @param {Response} res The Express response object
   */
  const destroy = async (req, res) => {
    const request = new RestRequest(req, res, options);

    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        throw new NotFoundError(`Resource with ID ${req.params.id} could not be found`);
      }

      await resource.destroy();
      request.withStatus(204);
    } catch (error) {
      request.withError(error);
    } finally {
      request.respond();
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
