const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Company = sequelize.define("Company", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  phone: {
    type: DataTypes.STRING,
  },

  email: {
    type: DataTypes.STRING,
  },

  address: {
    type: DataTypes.TEXT,
  },
});

module.exports = Company;