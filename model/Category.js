const { Sequelize, sequelize } = require('../lib/db');

const Category = sequelize.define('category', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Category;
