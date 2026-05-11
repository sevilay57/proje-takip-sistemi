const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProjectMaterial = sequelize.define("ProjectMaterial", {
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  quantityUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  totalCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

module.exports = ProjectMaterial;