const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const Product = sequelize.define(
  "Product",
  {
   id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscribe_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    normal_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    out_of_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscription_required: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mrp_price:{
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  },
  { tableName: "tbl_product", timestamps: true, paranoid: true }
);

module.exports = Product;