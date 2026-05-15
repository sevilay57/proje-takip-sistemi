const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Material = sequelize.define("Material", {

  materialCode: {
    type: DataTypes.STRING,
    defaultValue: "",
  },

  name: {
    type: DataTypes.STRING,
  },

  category: {
    type: DataTypes.STRING,
    defaultValue: "",
  },

  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  criticalStock: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },

  unit: {
    type: DataTypes.STRING,
    defaultValue: "adet",
  },

  unitPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  paidAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: "Ödenmedi",
  },

  warehouseLocation: {
    type: DataTypes.STRING,
    defaultValue: "",
  },

  description: {
    type: DataTypes.TEXT,
    defaultValue: "",
  },

  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

});

module.exports = Material;