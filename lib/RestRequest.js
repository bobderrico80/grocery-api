/**
 * @module RestRequest
 */
const Sequelize = require('sequelize');
const logger = require('./logger');
const NotFoundError = require('./NotFoundError');

/**
 * @typedef {object} Request The Express Request object
 * @property {object} body The Request body
 * @property {object} params An object containing the URL params
 */

/**
 * @typedef {object} Response The Express Response object
 * @property {(status: number) => void} status Sets the status for the response
 * @property {(json: object) => void} json Responds with a JSON response, serializing the passed-in
 * Javascript object.
 * @property {() => void} send Sends an empty response.
 */

/**
 * A class for handling the request-response life cycle of a Express HTTP request.
 */
class RestRequest {
  /**
   * Creates a new {@link RestRequest} instance. The constructor will also default the
   * {@link RestRequest.status} property to 200.
   * @param {Request} req The Express Request object
   * @param {Response} res The Express Response object
   * @param {import('./RestController').RestControllerOptions} options A reference to the
   * {@link RestController} options.
   */
  constructor(req, res, options) {
    this.req = req;
    this.res = res;
    this.status = 200;
    this.options = options;
  }

  /**
   * Sets data to be returned with the response.
   * @param {*} data The response data
   * @return {RestRequest}
   */
  withData(data) {
    this.data = data;
    return this;
  }

  /**
   * Sets HTTP status code to be returned with the response.
   * @param {number} status The status code.
   * @return {RestRequest}
   */
  withStatus(status) {
    this.status = status;
    return this;
  }

  /**
   * Sets an error that occurred during the request-response life cycle.
   * @param {Error} error The error object.
   * @return {RestRequest}
   */
  withError(error) {
    this.error = error;
    return this;
  }

  /**
   * Completes the request-response life cycle. This will eventually call {@link Response#send()} or
   * {@link Response#json()}, depending on whether {@link #data} has a value. If {@link error} has
   * a value, the error will be type-checked, and an appropriate error response will be returned.
   * An appropriate status code will also be sent. If no status code has been provided and there is
   * no error response, a status code of 200 will be sent.
   */
  respond() {
    if (this.error) {
      this.handleError();
      return;
    }

    this.handleResponse();
  }

  /**
   * Filters response data if a response data filter is found in {@link #options}.
   * @return {*} The possibly-filtered data.
   * @private
   */
  filterResponseData() {
    if (this.options.responseDataFilter) {
      return this.options.responseDataFilter(this.req, this.res, this.data);
    }

    return this.data;
  }

  /**
   * Handles server errors by logging the error message, and responding with a status code of 500,
   * and a 'server error' message.
   * @private
   */
  handleServerError() {
    logger.error(this.error.message);
    this.res.status(500);
    this.res.json({ message: 'server error' });
  }

  /**
   * Handles all responses, calling {@link Response#send()} if {@link #data} is falsy. Otherwise,
   * {@link #data} is filtered, and {@link Response#json()} is called with the filtered data. If an
   * error occurs during the filtering process, {@link #handleServerError} will be called.
   * @private
   */
  handleResponse() {
    this.res.status(this.status);

    if (!this.data) {
      this.res.send();
      return;
    }

    try {
      const filteredData = this.filterResponseData();
      this.res.json(filteredData);
    } catch (error) {
      this.error = error;
      this.handleServerError();
    }
  }

  /**
   * Handles all error conditions. {@link #error} will be type-checked, and appropriate response
   * bodies and status codes will be set.
   * - If the error is an instance of {@link Sequelize.UniqueConstraintError}, a 409 status will be
   * set, and the response data will be set to the error object.
   * - If the error is an instance of {@link Sequelize.ValidationError}, a 400 status will be
   * set, and the response data will be set to the error object.
   * - If the error is an instance of {@link NotFoundError}, a 404 status will be
   * set, and the response data will be set to a 'not found' message.
   * - Otherwise, {@link #handleServerError()} will be called.
   * @private
   */
  handleError() {
    if (this.error instanceof Sequelize.UniqueConstraintError) {
      this.status = 409;
      // TODO sanitize error response
      this.data = this.error;
      this.handleResponse();
      return;
    }

    if (this.error instanceof Sequelize.ValidationError) {
      this.status = 400;
      // TODO sanitize error response
      this.data = this.error;
      this.handleResponse();
      return;
    }

    if (this.error instanceof NotFoundError) {
      this.status = 404;
      this.data = { message: 'not found' };
      this.handleResponse();
      return;
    }

    this.handleServerError();
  }
}

module.exports = RestRequest;
