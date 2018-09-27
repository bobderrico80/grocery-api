const jwt = require('jsonwebtoken');
const NotAuthorizedError = require('../lib/NotAuthorizedError');
const RestRequest = require('../lib/RestRequest');
const User = require('../model/User');

// TODO Move these to configuration management
const jwtSecret = process.env.JWT_SECRET;
const expiresIn = 5 * 60; // 5 minutes from now

/**
 * Controller for handling logins and authenticating a user. Successful login requests will
 * include a JWT token in the response.
 * @param {import('../lib/RestRequest').Request} req The Express Request Object
 * @param {import('../lib/RestRequest').Response} res The Express Response object
 */
const login = async (req, res) => {
  const request = new RestRequest(req, res);

  const { email, password } = req.body;

  try {
    if (!jwtSecret) {
      throw new Error('No JWT secret is configured');
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new NotAuthorizedError();
    }

    const valid = await user.validatePassword(password);

    if (!valid) {
      throw new NotAuthorizedError();
    }

    const token = jwt.sign({ email }, jwtSecret, { expiresIn });
    request.withData({ token });
  } catch (error) {
    request.withError(error);
  } finally {
    request.respond();
  }
};

module.exports = { login };
