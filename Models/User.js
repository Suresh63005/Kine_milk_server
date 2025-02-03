const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ccode: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    otp:{
      type:DataTypes.TEXT,
    },
    refercode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parentcode: {
      type: DataTypes.TEXT,
      defaultValue: false,
    },
    password: {
      type: DataTypes.TEXT,
      defaultValue: true,
    },
    registartion_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    wallet: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
  },
  { tableName: "tbl_user", timestamps: true, paranoid: true }
);

module.exports = User;
