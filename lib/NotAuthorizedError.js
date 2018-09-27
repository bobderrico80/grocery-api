/**
 * An Error to be thrown when a user is not authorized.
 * @module NotAuthorizedError
 */
class NotAuthorizedError extends Error {
  constructor(...args) {
    super(...args);
    Error.captureStackTrace(this, NotAuthorizedError);
  }
}

module.exports = NotAuthorizedError;
