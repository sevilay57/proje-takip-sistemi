const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Company = sequelize.define("Company", {
  code: {
    type: DataTypes.STRING,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  type: {
    type: DataTypes.STRING,
  },

  authorized: {
    type: DataTypes.STRING,
  },

  phone: {
    type: DataTypes.STRING,
  },

  email: {
    type: DataTypes.STRING,
  },

  taxNumber: {
    type: DataTypes.STRING,
  },

  taxOffice: {
    type: DataTypes.STRING,
  },

  address: {
    type: DataTypes.TEXT,
  },

  balance: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  currency: {
    type: DataTypes.STRING,
    defaultValue: "TL",
  },

  paymentType: {
    type: DataTypes.STRING,
  },

  dueDay: {
    type: DataTypes.STRING,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Aktif",
  },

  notes: {
    type: DataTypes.TEXT,
  },
});

module.exports = Company;