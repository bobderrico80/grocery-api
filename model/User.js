const bcrypt = require('bcrypt');
const { Sequelize, sequelize } = require('../lib/db');

const User = sequelize.define(
  'user',
  {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    name: { type: Sequelize.STRING, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        // eslint-disable-next-line no-param-reassign
        user.password = hashedPassword;
      },
    },
  },
);

module.exports = User;
