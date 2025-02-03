const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Page = sequelize.define(
  "Page",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
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
  { tableName: "tbl_page", timestamps: true, paranoid: true }
);

module.exports = Page;
