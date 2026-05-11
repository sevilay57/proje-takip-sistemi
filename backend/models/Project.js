const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Project = sequelize.define("Project", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

 status: {
  type: DataTypes.STRING,
  defaultValue: "Devam Ediyor",
},

offerAmount: {
  type: DataTypes.FLOAT,
  defaultValue: 0,
},
});

module.exports = Project;