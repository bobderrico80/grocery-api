const { Sequelize, sequelize } = require('../lib/db');

const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  name: { type: Sequelize.STRING, allowNull: false },
});

module.exports = User;
