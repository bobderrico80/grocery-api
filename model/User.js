const bcrypt = require('bcrypt');
const { Sequelize, sequelize } = require('../lib/db');

const hashPassword = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 12);
  // eslint-disable-next-line no-param-reassign
  user.password = hashedPassword;
};

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
      beforeCreate: hashPassword,
      beforeUpdate: async (user) => {
        // Update the password if it has changed
        if (user.previous('password') !== user.password) {
          await hashPassword(user);
        }
      },
    },
  },
);

module.exports = User;
