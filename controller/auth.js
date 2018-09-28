const { createJwt } = require('../lib/auth');
const NotAuthorizedError = require('../lib/NotAuthorizedError');
const RestRequest = require('../lib/RestRequest');
const User = require('../model/User');

const jwtSecret = process.env.JWT_SECRET;
const issuer = process.env.JWT_ISSUER;
const audience = process.env.JWT_AUDIENCE;

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
    if (!jwtSecret || !issuer || !audience) {
      throw new Error('JWT_SECRET, JWT_ISSUER, and JWT_AUDIENCE are not configured!');
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new NotAuthorizedError();
    }

    const valid = await user.validatePassword(password);

    if (!valid) {
      throw new NotAuthorizedError();
    }

    const token = createJwt(user);
    request.withData({ token });
  } catch (error) {
    request.withError(error);
  } finally {
    request.respond();
  }
};

module.exports = { login };
