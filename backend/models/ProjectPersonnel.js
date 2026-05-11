const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProjectPersonnel = sequelize.define("ProjectPersonnel", {
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  personnelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = ProjectPersonnel;