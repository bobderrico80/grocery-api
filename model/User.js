const bcrypt = require('bcrypt');
const { Sequelize, sequelize } = require('../lib/db');

/**
 * Hash the password for the given user. This method will mutate the user object, over-writing the
 * `password` property with the hashed password.
 * @param {object} user The user object
 */
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

/**
 * Validates the given password against the encrypted password saved on the user.
 * @param {string} password The password to validate
 * @return {boolean} True if the password validates successfully.
 */
User.prototype.validatePassword = async function validatePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
