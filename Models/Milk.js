const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Milk = sequelize.define(
  "Milm",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    data: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
  },
  { tableName: "tbl_milk", timestamps: true, paranoid: true }
);

module.exports = Milk;
