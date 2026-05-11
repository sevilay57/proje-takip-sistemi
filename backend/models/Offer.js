const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Offer = sequelize.define("Offer", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "Beklemede",
  },
});

module.exports = Offer;
