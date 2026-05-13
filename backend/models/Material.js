const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Material = sequelize.define("Material", {

  materialCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  category: {
    type: DataTypes.STRING,
    defaultValue: "Genel",
  },

  brand: {
    type: DataTypes.STRING,
    defaultValue: "",
  },

  model: {
    type: DataTypes.STRING,
    defaultValue: "",
  },

  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  unit: {
    type: DataTypes.STRING,
    defaultValue: "adet",
  },

  unitPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  criticalStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
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