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
    cat_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT,
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
    out_of_stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subscription_required: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    discount: {
      type: DataTypes.FLOAT, // Use FLOAT for percentage values
      allowNull: true, // Optional field
      defaultValue: 0, // Default to 0 if not provided
    },
  },
  {
    tableName: "tbl_product",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Product;