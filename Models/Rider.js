const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Rider = sequelize.define(
  "Rider",
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
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    eamil: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ccode: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "tbl_rider", timestamps: true, paranoid: true }
);

module.exports = Rider;
