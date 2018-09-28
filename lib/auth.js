/**
 * Module containing authentication and authorization-related logic
 * @module auth
 */
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { ExtractJwt } = require('passport-jwt');
const NotAuthorizedError = require('../lib/NotAuthorizedError');
const RestRequest = require('../lib/RestRequest');
const logger = require('../lib/logger');

// TODO Pull these values from configuration management
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  expiresIn: 5 * 60, // 5 minutes from now
};

/**
 * Creates a Passport JWT verifier function for the given User model. The returned function will be
 * passed the JWT payload object containing the user's ID and an error-first done callback by
 * Passport JWT. If Passport JWT had an error verifying the JWT, the payload will be an object
 * containing error information, rather than the user's ID.
 *
 * If the JWT payload contains the user ID, the user will be found and passed into the done()
 * callback.
 *
 * If the JWT payload does not contain the user ID, or the user could not be found, the done()
 * callback will be called with `false` for the second parameter.
 *
 * If an error occurs while finding the user, the done() callback will be called with the error.
 * @param {object} User The User model object
 * @return {(jwtPayload: string, done: function) => void} The Passport JWT verifier function.
 */
const jwtVerify = User => async (jwtPayload, done) => {
  try {
    if (!jwtPayload.id) {
      done(null, false);
      return;
    }

    const user = await User.findById(jwtPayload.id);

    if (user) {
      done(null, user);
      return;
    }

    done(null, false);
  } catch (error) {
    done(error);
  }
};

/**
 * A middleware function that uses the Passport JWT strategy to authenticate the request with a JWT.
 *
 * This function calls `passport.authenticate()`, providing a custom callback handler. If an error
 * is provided to the handler, `next()` will be called with the error. If a user is provided, the
 * user has been authenticated by Passport, and call `next()`. If a user is not provided, a
 * 401 Not Authorized response is built and sent.
 *
 * If an info object is provided by Passport JWT, it will be logged.
 * @param {import('../lib/RestRequest').Request} req The Express Request Object
 * @param {import('../lib/RestRequest').Response} res The Express Response Object
 * @param {function} next The next middleware function.
 */
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, info) => {
    if (info) {
      logger.info(info);
    }

    if (error) {
      next(error);
      return;
    }

    if (!user) {
      const request = new RestRequest(req, res);
      request.withError(new NotAuthorizedError()).respond();
      return;
    }

    next();
  })(req, res, next);
};

/**
 * Creates a signed JWT for the given user and configuration. The JWT will contain the user's ID
 * in the payload, and will be configured with the currently configured expiresIn, audience, and
 * issuer options.
 * @param {object} user The user object.
 * @return {string} The JWT token.
 */
const createJwt = user =>
  jwt.sign({ id: user.id }, jwtOptions.secretOrKey, {
    expiresIn: jwtOptions.expiresIn,
    audience: jwtOptions.audience,
    issuer: jwtOptions.issuer,
  });

module.exports = {
  createJwt,
  authenticate,
  jwtOptions,
  jwtVerify,
};
