const RestController = require('../lib/RestController');
const removeFields = require('../lib/removeFields');
const User = require('../model/User');

module.exports = RestController(User, {
  // Remove password fields from responses.
  responseDataFilter: (req, res, data) => removeFields(data, ['password']),
});
