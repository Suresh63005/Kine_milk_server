const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const StoreNotification = sequelize.define(
  "StoreNotification",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    sid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { tableName: "tbl_snoti", timestamps: true, paranoid: true }
);

module.exports = StoreNotification;
