const RestController = require('../lib/RestController');
const User = require('../model/User');

module.exports = RestController(User);
