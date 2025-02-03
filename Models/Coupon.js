const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coupon_img: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    expire_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    min_amt: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    coupon_val: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  { tableName: "tbl_coupon", timestamps: true, paranoid: true }
);

module.exports = Coupon;
