const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Coupon = sequelize.define(
  "Coupon",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    store_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    coupon_img: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.TEXT,
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
