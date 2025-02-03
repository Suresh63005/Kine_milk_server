const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const SubscribeOrderProduct = sequelize.define(
  "SubscribeOrderProduct",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    oid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pquantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ptitle: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pdiscount: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pimg: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    pprice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ptype: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startdate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totaldelivery: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totaldates: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    completedates: {
      type: DataTypes.TEXT,
      defaultValue: false,
    },
    selectday: {
      type: DataTypes.TEXT,
      defaultValue: false,
    },
    tslot: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  { tableName: "tbl_subscribe_order_product", timestamps: true, paranoid: true }
);

module.exports = SubscribeOrderProduct;
