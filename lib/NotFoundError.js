/**
 * An Error to be returned when a resource cannot be found.
 * @module NotFoundError
 */
class NotFoundError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, NotFoundError);
  }
}

module.exports = NotFoundError;
