const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('yody', 'postgres', 'admin', {
  host: 'localhost',
  dialect: "postgres"
});

module.exports = sequelize ;