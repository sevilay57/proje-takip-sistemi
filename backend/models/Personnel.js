const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Personnel = sequelize.define("Personnel", {

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  department: {
    type: DataTypes.STRING,
  },

  title: {
    type: DataTypes.STRING,
  },

  phone: {
    type: DataTypes.STRING,
  },

  email: {
    type: DataTypes.STRING,
  },

});

module.exports = Personnel;