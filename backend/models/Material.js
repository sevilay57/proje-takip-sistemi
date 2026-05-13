const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Material = sequelize.define("Material", {
  name: {
    type: DataTypes.STRING,
    materialCode: {
  type: DataTypes.STRING,
},
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