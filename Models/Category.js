const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cover: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  { tableName: "tbl_category", timestamps: true, paranoid: true }
);

module.exports = Category;
