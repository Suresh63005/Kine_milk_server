const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const Product = require("./Product");
const SubscribeOrder = require("./SubscribeOrder");

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
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: SubscribeOrder, key: "id" },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Product, key: "id" },
    },
    pquantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
  },
  { tableName: "tbl_subscribe_order_product", timestamps: true, paranoid: true }
);

module.exports = SubscribeOrderProduct;
