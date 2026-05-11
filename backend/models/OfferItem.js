const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OfferItem = sequelize.define("OfferItem", {
  offerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },

  unitPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  totalPrice: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
});

module.exports = OfferItem;