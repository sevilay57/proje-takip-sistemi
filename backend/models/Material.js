const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Material = sequelize.define("Material", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
  supplierId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},
});

module.exports = Material;