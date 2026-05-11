const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Supplier = sequelize.define("Supplier", {
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

module.exports = Supplier;