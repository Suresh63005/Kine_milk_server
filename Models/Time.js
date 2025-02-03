const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Time = sequelize.define(
  "Time",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mintime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    maxtime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "tbl_time", timestamps: true, paranoid: true }
);

module.exports = Time;
