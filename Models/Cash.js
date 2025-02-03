const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Cash = sequelize.define(
  "Cash",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    rid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amt: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { tableName: "tbl_cash", timestamps: true, paranoid: true }
);

module.exports = Cash;
